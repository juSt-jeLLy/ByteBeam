interface SelectedRouteSummaryProps {
  trip?: {
    distanceKm: number;
    durationMinutes: number;
    overspeedEvents: number;
  };
}

export function SelectedRouteSummary({ trip }: SelectedRouteSummaryProps) {
  if (!trip) return null;

  return (
    <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
      <span>{trip.distanceKm} km</span>
      <span>{trip.durationMinutes} min</span>
      <span>{trip.overspeedEvents} overspeed</span>
    </div>
  );
}
