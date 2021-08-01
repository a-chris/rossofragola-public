const MAX_AFFINITY = 5;

export function mapAffinity(affinity) {
    return (Math.round(affinity * MAX_AFFINITY * 100) / 100).toFixed(2);
}
