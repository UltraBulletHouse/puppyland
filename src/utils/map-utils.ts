export const generatePulsatingMarker = (L: any, radius: number, color: string) => {
  const cssStyle = `
    width: ${radius}px;
    height: ${radius}px;
    background: ${color};
    color: ${color};
    box-shadow: 0 0 0 ${color};
  `;
  return L.divIcon({
    html: `<span style="${cssStyle}" id="pulse"/>`,
    className: '',
  });
};
