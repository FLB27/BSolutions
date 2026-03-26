export function distance(lat1, lon1, lat2, lon2) { //On doit donner les coordonnées entre les deux points
    // Formule haversine = permet de calculer la distance sur une sphère en tenant compte de sa courbure
    const R = 6371e3; // rayon Terre en m
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // distance en mètres entre les deux points
}

