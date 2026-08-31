function getAppBasePath() {
  const pathname = window.location.pathname.replace(/\/$/, '');
  return pathname.endsWith('/overlay')
    ? pathname.slice(0, -'/overlay'.length)
    : pathname;
}

export function resolvePortraitUrl(portrait?: string) {
  if (!portrait || /^(data:|blob:|https?:\/\/)/.test(portrait)) {
    return portrait;
  }

  const staticMediaMarker = '/static/media/';
  const markerIndex = portrait.indexOf(staticMediaMarker);
  const relativeStaticMediaMarker = 'static/media/';
  const relativeMarkerIndex = portrait.indexOf(relativeStaticMediaMarker);
  if (markerIndex >= 0) {
    return `${getAppBasePath()}${staticMediaMarker}${portrait.slice(markerIndex + staticMediaMarker.length)}`;
  }
  if (relativeMarkerIndex >= 0) {
    return `${getAppBasePath()}${staticMediaMarker}${portrait.slice(relativeMarkerIndex + relativeStaticMediaMarker.length)}`;
  }

  return portrait;
}
