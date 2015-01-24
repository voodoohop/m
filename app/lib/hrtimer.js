export default function hrTimeInSeconds(startTime = undefined) {
  var current;
  if (startTime !== undefined) {
    startTime = [Math.floor(startTime), (startTime % 1) * 1000000000];
    current = process.hrtime(startTime);
  } else
    current = process.hrtime();
  return current[0] + current[1] / 1000000000
}