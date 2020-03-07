export function getSafeArea() {
  const div = document.createElement('div');
  div.style.padding = 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(div);
  const computed = getComputedStyle(div);
  const result = {
    top: parseInt(computed.paddingTop) || 0,
    right: parseInt(computed.paddingRight) || 0,
    bottom: parseInt(computed.paddingBottom) || 0,
    left: parseInt(computed.paddingLeft) || 0
  };
  document.body.removeChild(div);
  console.log(result);
  return result;
}
