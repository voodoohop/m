#!/usr/bin/env python

import argparse
import errno
import glob
import os
import subprocess
import sys
import tempfile

from lib.config import DIST_ARCH, TARGET_PLATFORM
from lib.util import execute, get_atom_shell_version, parse_version, \
                     get_chromedriver_version, scoped_cwd, safe_mkdir, \
                     s3_config, s3put
from lib.github import GitHub


ATOM_SHELL_REPO = 'atom/atom-shell'
ATOM_SHELL_VERSION = get_atom_shell_version()
CHROMEDRIVER_VERSION = get_chromedriver_version()

SOURCE_ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
OUT_DIR = os.path.join(SOURCE_ROOT, 'out', 'Release')
DIST_DIR = os.path.join(SOURCE_ROOT, 'dist')
DIST_NAME = 'atom-shell-{0}-{1}-{2}.zip'.format(ATOM_SHELL_VERSION,
                                                TARGET_PLATFORM,
                                                DIST_ARCH)
SYMBOLS_NAME = 'atom-shell-{0}-{1}-{2}-symbols.zip'.format(ATOM_SHELL_VERSION,
                                                           TARGET_PLATFORM,
                                                           DIST_ARCH)
CHROMEDRIVER_NAME = 'chromedriver-{0}-{1}-{2}.zip'.format(CHROMEDRIVER_VERSION,
                                                          TARGET_PLATFORM,
                                                          DIST_ARCH)


def main():
  args = parse_args()

  if not dist_newer_than_head():
    create_dist = os.path.join(SOURCE_ROOT, 'script', 'create-dist.py')
    execute([sys.executable, create_dist])

  build_version = get_atom_shell_build_version()
  if not ATOM_SHELL_VERSION.startswith(build_version):
    error = 'Tag name ({0}) should match build version ({1})\n'.format(
        ATOM_SHELL_VERSION, build_version)
    sys.stderr.write(error)
    sys.stderr.flush()
    return 1

  # Upload atom-shell with GitHub Releases API.
  github = GitHub(auth_token())
  release_id = create_or_get_release_draft(github, args.version)
  upload_atom_shell(github, release_id, os.path.join(DIST_DIR, DIST_NAME))
  upload_atom_shell(github, release_id, os.path.join(DIST_DIR, SYMBOLS_NAME))

  # Upload chromedriver for minor version update.
  if parse_version(args.version)[2] == '0':
    upload_atom_shell(github, release_id,
                      os.path.join(DIST_DIR, CHROMEDRIVER_NAME))

  if args.publish_release:
    # Upload node's headers to S3.
    bucket, access_key, secret_key = s3_config()
    upload_node(bucket, access_key, secret_key, ATOM_SHELL_VERSION)

    # Upload the SHASUMS.txt.
    execute([sys.executable,
             os.path.join(SOURCE_ROOT, 'script', 'upload-checksums.py'),
             '-v', ATOM_SHELL_VERSION])

    # Upload PDBs to Windows symbol server.
    if TARGET_PLATFORM == 'win32':
      execute([sys.executable,
               os.path.join(SOURCE_ROOT, 'script', 'upload-windows-pdb.py')])

    # Press the publish button.
    publish_release(github, release_id)


def parse_args():
  parser = argparse.ArgumentParser(description='upload distribution file')
  parser.add_argument('-v', '--version', help='Specify the version',
                      default=ATOM_SHELL_VERSION)
  parser.add_argument('-p', '--publish-release',
                      help='Publish the release',
                      action='store_true')
  return parser.parse_args()


def get_atom_shell_build_version():
  if TARGET_PLATFORM == 'darwin':
    atom_shell = os.path.join(SOURCE_ROOT, 'out', 'Release', 'Atom.app',
                              'Contents', 'MacOS', 'Atom')
  elif TARGET_PLATFORM == 'win32':
    atom_shell = os.path.join(SOURCE_ROOT, 'out', 'Release', 'atom.exe')
  else:
    atom_shell = os.path.join(SOURCE_ROOT, 'out', 'Release', 'atom')

  return subprocess.check_output([atom_shell, '--version']).strip()


def dist_newer_than_head():
  with scoped_cwd(SOURCE_ROOT):
    try:
      head_time = subprocess.check_output(['git', 'log', '--pretty=format:%at',
                                           '-n', '1']).strip()
      dist_time = os.path.getmtime(os.path.join(DIST_DIR, DIST_NAME))
    except OSError as e:
      if e.errno != errno.ENOENT:
        raise
      return False

  return dist_time > int(head_time)


def get_text_with_editor(name):
  editor = os.environ.get('EDITOR', 'nano')
  initial_message = '\n# Please enter the body of your release note for %s.' \
                    % name

  t = tempfile.NamedTemporaryFile(suffix='.tmp', delete=False)
  t.write(initial_message)
  t.close()
  subprocess.call([editor, t.name])

  text = ''
  for line in open(t.name, 'r'):
    if len(line) == 0 or line[0] != '#':
      text += line

  os.unlink(t.name)
  return text

def create_or_get_release_draft(github, tag):
  name = 'atom-shell %s' % tag
  releases = github.repos(ATOM_SHELL_REPO).releases.get()
  for release in releases:
    # The untagged commit doesn't have a matching tag_name, so also check name.
    if release['tag_name'] == tag or release['name'] == name:
      return release['id']

  return create_release_draft(github, tag)


def create_release_draft(github, tag):
  name = 'atom-shell %s' % tag
  body = get_text_with_editor(name)
  if body == '':
    sys.stderr.write('Quit due to empty release note.\n')
    sys.exit(0)

  data = dict(tag_name=tag, name=name, body=body, draft=True)
  r = github.repos(ATOM_SHELL_REPO).releases.post(data=data)
  return r['id']


def upload_atom_shell(github, release_id, file_path):
  params = {'name': os.path.basename(file_path)}
  headers = {'Content-Type': 'application/zip'}
  with open(file_path, 'rb') as f:
    github.repos(ATOM_SHELL_REPO).releases(release_id).assets.post(
        params=params, headers=headers, data=f, verify=False)


def publish_release(github, release_id):
  data = dict(draft=False)
  github.repos(ATOM_SHELL_REPO).releases(release_id).patch(data=data)


def upload_node(bucket, access_key, secret_key, version):
  os.chdir(DIST_DIR)

  s3put(bucket, access_key, secret_key, DIST_DIR,
        'atom-shell/dist/{0}'.format(version), glob.glob('node-*.tar.gz'))

  if TARGET_PLATFORM == 'win32':
    # Generate the node.lib.
    build = os.path.join(SOURCE_ROOT, 'script', 'build.py')
    execute([sys.executable, build, '-c', 'Release', '-t', 'generate_node_lib'])

    # Upload the 32bit node.lib.
    node_lib = os.path.join(OUT_DIR, 'node.lib')
    s3put(bucket, access_key, secret_key, OUT_DIR,
          'atom-shell/dist/{0}'.format(version), [node_lib])

    # Upload the fake 64bit node.lib.
    touch_x64_node_lib()
    node_lib = os.path.join(OUT_DIR, 'x64', 'node.lib')
    s3put(bucket, access_key, secret_key, OUT_DIR,
          'atom-shell/dist/{0}'.format(version), [node_lib])


def auth_token():
  token = os.environ.get('ATOM_SHELL_GITHUB_TOKEN')
  message = ('Error: Please set the $ATOM_SHELL_GITHUB_TOKEN '
             'environment variable, which is your personal token')
  assert token, message
  return token


def touch_x64_node_lib():
  x64_dir = os.path.join(OUT_DIR, 'x64')
  safe_mkdir(x64_dir)
  with open(os.path.join(x64_dir, 'node.lib'), 'w+') as node_lib:
    node_lib.write('Invalid library')


if __name__ == '__main__':
  import sys
  sys.exit(main())
