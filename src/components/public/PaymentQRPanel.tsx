import Image from "next/image";

// Shown only *after* a booking is submitted — never on the open page. Payment
// details on public display invite transfers from people we cannot match to a
// booking, and reconciling an unattributed ₱500 against a list of names is
// exactly the manual work this is meant to avoid.
//
// The reference-number request is the whole point of the panel. Without it,
// confirming a seat means comparing timestamps and hoping.

const METHODS = [
  {
    label: "GCash",
    src: "/payment/gcash-qr.jpg",
    accent: "from-blue-500 to-blue-600",
    note: "Scan in the GCash app",
  },
  {
    label: "Landbank",
    src: "/payment/landbank-qr.jpg",
    accent: "from-emerald-500 to-green-600",
    note: "Scan in your banking app — InstaPay",
  },
] as const;

export function PaymentQRPanel({ amountLabel }: { amountLabel: string }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-4 text-center">
        <p className="text-xs font-bold tracking-widest text-amber-950 uppercase">
          Last step — reserve your seat
        </p>
        <p className="mt-1 font-serif text-3xl font-light text-amber-950">Send {amountLabel}</p>
      </div>

      <div className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {METHODS.map((m) => (
            <div key={m.label} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <p
                className={`bg-gradient-to-r ${m.accent} px-4 py-2 text-center text-sm font-bold tracking-wide text-white uppercase`}
              >
                {m.label}
              </p>
              <div className="p-3">
                <Image
                  src={m.src}
                  alt={`${m.label} payment QR code`}
                  width={600}
                  height={800}
                  className="mx-auto h-auto w-full max-w-[240px] rounded-lg"
                />
                <p className="mt-2 text-center text-xs text-slate-500">{m.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border-2 border-dashed border-amber-400 bg-white/70 p-5">
          <p className="text-sm font-bold text-slate-900">
            Then reply to your confirmation email with the reference number.
          </p>
          <p className="mt-1.5 text-sm text-slate-600">
            That is how we match your payment to your seat. Without it we cannot confirm you, and
            your place is not held until we do.
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Payments are received by Richard Javier on behalf of Strategnosis Solutions OPC. An
          official receipt follows confirmation.
        </p>
      </div>
    </div>
  );
}
