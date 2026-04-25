'use client';

// ── Types ──────────────────────────────────────────────────────────────��──────

type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED';

interface TimelineStep {
  key:   string;
  label: string;
  sub:   string;
}

// ── Step config ───────────────────────────────────────────────────────────────

const STEPS: TimelineStep[] = [
  { key: 'ORDER_PLACED',      label: 'Order Placed',      sub: 'We have received your order' },
  { key: 'SHIPPED',           label: 'Shipped',           sub: 'Your order is on its way'    },
  { key: 'OUT_FOR_DELIVERY',  label: 'Out for Delivery',  sub: 'Almost there!'               },
  { key: 'DELIVERED',         label: 'Delivered',         sub: 'Order has been delivered'    },
];

// Compute which step index is "active" based on status + shipmentStatus
function resolveActiveIndex(
  status:          OrderStatus,
  shipmentStatus?: string | null,
): number {
  if (status === 'DELIVERED')                             return 3;
  if (shipmentStatus === 'OUT_FOR_DELIVERY')              return 2;
  if (status === 'SHIPPED')                               return 1;
  return 0;
}

// ── Icon components ──────────────────────────────────────────────────────���────

function DoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function StepIcons({ index }: { index: number }) {
  const icons = ['📋', '🚚', '🛵', '✅'];
  return <span className="text-sm leading-none">{icons[index]}</span>;
}

// ── Main component ────────────────────────────────────────────────────────────

export interface OrderTimelineProps {
  status:          OrderStatus;
  shipmentStatus?: string | null;
  createdAt?:      string;
  updatedAt?:      string;
}

export default function OrderTimeline({
  status,
  shipmentStatus,
  createdAt,
  updatedAt,
}: OrderTimelineProps) {
  const activeIndex = resolveActiveIndex(status, shipmentStatus);

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const done    = i <= activeIndex;
        const active  = i === activeIndex;
        const isLast  = i === STEPS.length - 1;

        return (
          <div key={step.key} className="flex gap-4">
            {/* ── Left: dot + vertical line ── */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 z-10 transition-all ${
                  done
                    ? active
                      ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-200 ring-4 ring-green-100'
                      : 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {done
                  ? (active ? <StepIcons index={i} /> : <DoneIcon />)
                  : <StepIcons index={i} />
                }
              </div>
              {/* Connector line */}
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 min-h-[28px] transition-colors ${
                  i < activeIndex ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </div>

            {/* ── Right: content ── */}
            <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-sm font-bold leading-tight ${
                    done ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    active ? 'text-green-600 font-medium' : done ? 'text-gray-500' : 'text-gray-300'
                  }`}>
                    {active ? step.sub : done ? step.sub : 'Pending'}
                  </p>
                </div>

                {/* Timestamp */}
                {done && (
                  <p className="text-[11px] text-gray-400 shrink-0">
                    {i === 0 && createdAt
                      ? new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : i === activeIndex && updatedAt
                        ? new Date(updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : null
                    }
                  </p>
                )}
              </div>

              {/* Active pulse badge */}
              {active && (
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Current Status
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
