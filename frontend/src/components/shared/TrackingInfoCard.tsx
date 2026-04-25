'use client';

export interface TrackingInfoCardProps {
  trackingId:    string | null | undefined;
  courierName:   string | null | undefined;
  trackingUrl:   string | null | undefined;
  shipmentStatus?: string | null;
}

export default function TrackingInfoCard({
  trackingId,
  courierName,
  trackingUrl,
  shipmentStatus,
}: TrackingInfoCardProps) {
  const hasAnyInfo = trackingId || courierName;

  if (!hasAnyInfo) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-lg">🚚</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">Awaiting Shipment</p>
            <p className="text-xs text-blue-500 mt-0.5">Tracking details will appear once your order is shipped.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 flex items-center gap-3">
        <span className="text-white text-lg">🚚</span>
        <div>
          <p className="text-white text-sm font-bold leading-none">Shipment Tracking</p>
          {shipmentStatus && (
            <p className="text-blue-100 text-[11px] mt-0.5 font-medium capitalize">
              {shipmentStatus.replace(/_/g, ' ').toLowerCase()}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3">
        {courierName && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Courier</span>
            <span className="text-sm font-bold text-gray-800">{courierName}</span>
          </div>
        )}

        {trackingId && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tracking ID</span>
            <span className="text-sm font-mono font-bold text-gray-800 select-all">{trackingId}</span>
          </div>
        )}

        {/* Copy + Track buttons */}
        <div className="pt-2 flex gap-2">
          {trackingId && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(trackingId).catch(() => {});
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy ID
            </button>
          )}

          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Track Package
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
