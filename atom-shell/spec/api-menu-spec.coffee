assert = require 'assert'
remote = require 'remote'

Menu     = remote.require 'menu'
MenuItem = remote.require 'menu-item'

describe 'menu module', ->
  describe 'Menu.buildFromTemplate', ->
    it 'should be able to attach extra fields', ->
      menu = Menu.buildFromTemplate [label: 'text', extra: 'field']
      assert.equal menu.items[0].extra, 'field'

  describe 'Menu.insert', ->
    it 'should store item in @items by its index', ->
      menu = Menu.buildFromTemplate [
        {label: '1'}
        {label: '2'}
        {label: '3'}
      ]
      item = new MenuItem(label: 'inserted')
      menu.insert 1, item

      assert.equal menu.items[0].label, '1'
      assert.equal menu.items[1].label, 'inserted'
      assert.equal menu.items[2].label, '2'
      assert.equal menu.items[3].label, '3'

  describe 'MenuItem.click', ->
    it 'should be called with the item object passed', (done) ->
      menu = Menu.buildFromTemplate [
        label: 'text'
        click: (item) ->
          assert.equal item.constructor.name, 'MenuItem'
          assert.equal item.label, 'text'
          done()
      ]
      menu.delegate.executeCommand menu.items[0].commandId

  describe 'MenuItem with checked property', ->
    it 'clicking an checkbox item should flip the checked property', ->
      menu = Menu.buildFromTemplate [ label: 'text', type: 'checkbox' ]
      assert.equal menu.items[0].checked, false
      menu.delegate.executeCommand menu.items[0].commandId
      assert.equal menu.items[0].checked, true

    it 'clicking an radio item should always make checked property true', ->
      menu = Menu.buildFromTemplate [ label: 'text', type: 'radio' ]
      menu.delegate.executeCommand menu.items[0].commandId
      assert.equal menu.items[0].checked, true
      menu.delegate.executeCommand menu.items[0].commandId
      assert.equal menu.items[0].checked, true

    it 'at least have one item checked in each group', ->
      template = []
      template.push label: "#{i}", type: 'radio' for i in [0..10]
      template.push type: 'separator'
      template.push label: "#{i}", type: 'radio' for i in [12..20]
      menu = Menu.buildFromTemplate template
      menu.delegate.menuWillShow()
      assert.equal menu.items[0].checked, true
      assert.equal menu.items[12].checked, true

    it 'should assign groupId automatically', ->
      template = []
      template.push label: "#{i}", type: 'radio' for i in [0..10]
      template.push type: 'separator'
      template.push label: "#{i}", type: 'radio' for i in [12..20]
      menu = Menu.buildFromTemplate template
      groupId = menu.items[0].groupId
      assert.equal menu.items[i].groupId, groupId for i in [0..10]
      assert.equal menu.items[i].groupId, groupId + 1 for i in [12..20]

    it "setting 'checked' should flip other items' 'checked' property", ->
      template = []
      template.push label: "#{i}", type: 'radio' for i in [0..10]
      template.push type: 'separator'
      template.push label: "#{i}", type: 'radio' for i in [12..20]
      menu = Menu.buildFromTemplate template
      assert.equal menu.items[i].checked, false for i in [0..10]
      menu.items[0].checked = true
      assert.equal menu.items[0].checked, true
      assert.equal menu.items[i].checked, false for i in [1..10]
      menu.items[10].checked = true
      assert.equal menu.items[10].checked, true
      assert.equal menu.items[i].checked, false for i in [0..9]
      assert.equal menu.items[i].checked, false for i in [12..20]
      menu.items[12].checked = true
      assert.equal menu.items[10].checked, true
      assert.equal menu.items[i].checked, false for i in [0..9]
      assert.equal menu.items[12].checked, true
      assert.equal menu.items[i].checked, false for i in [13..20]
