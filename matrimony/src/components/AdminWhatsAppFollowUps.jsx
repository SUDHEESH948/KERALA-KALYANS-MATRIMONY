import { MessageSquare } from "lucide-react";

const registrationDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const displayDay = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  dateStyle: "medium",
});

function calendarDate(date) {
  const parts = Object.fromEntries(
    registrationDay.formatToParts(date).map(({ type, value }) => [type, Number(value)]),
  );
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function sixMonthAnniversary(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 6;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
}

function whatsappNumber(phone) {
  const compact = phone?.trim().replace(/[\s().-]/g, "") ?? "";
  if (/^[6-9]\d{9}$/.test(compact)) return `91${compact}`;
  if (/^0[6-9]\d{9}$/.test(compact)) return `91${compact.slice(1)}`;
  if (/^91[6-9]\d{9}$/.test(compact)) return compact;
  const international = compact.replace(/^00/, "+");
  return /^\+[1-9]\d{6,14}$/.test(international) ? international.slice(1) : null;
}

export default function AdminWhatsAppFollowUps({ profiles, isLoading, lastRefreshedAt }) {
  const today = calendarDate(lastRefreshedAt);
  const followUps = profiles.flatMap((profile) => {
    if (!profile.createdAt) return [];
    const timestamp = new Date(profile.createdAt);
    if (Number.isNaN(timestamp.getTime())) return [];
    const registered = calendarDate(timestamp);
    const due = sixMonthAnniversary(registered);
    if (due > today) return [];
    return [{ profile, registered, due, number: whatsappNumber(profile.phone) }];
  }).sort((a, b) => b.due - a.due);

  return (
    <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-4 sm:p-6">
      <h2 className="text-xl text-[var(--admin-gold-ink)] sm:text-2xl">
        Six-month WhatsApp follow-ups
      </h2>
      <p className="mt-2 text-sm text-[var(--admin-gold-text)]">
        Customers appear here once six calendar months have passed since registration.
        Open WhatsApp to review and send the prepared message.
      </p>

      {followUps.length === 0 ? (
        <p className="mt-5 text-sm text-[var(--admin-gold-text)]">
          {isLoading ? "Loading customers…" : "No customers have reached six months yet."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--admin-border)]">
          {followUps.map(({ profile, registered, due, number }) => {
            const name = profile.name?.trim() || "there";
            const message = `Hi ${name}, it’s been six months since you registered with Kerala Kalyans Matrimony. How has your search been going? Please reply if you’d like any help with your profile or finding matches.`;

            return (
              <li key={profile._id || profile.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <h3 className="card-title break-words text-base text-[var(--admin-gold-ink)]">
                    {profile.name || "Customer"}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--admin-gold-text)]">
                    Registered {displayDay.format(registered)} · Reached six months {displayDay.format(due)}
                  </p>
                </div>
                {number ? (
                  <a
                    className="cta inline-flex items-center gap-2 rounded-lg bg-[var(--admin-gold)] px-3 py-2 text-sm text-[var(--admin-gold-ink)] hover:bg-[var(--admin-gold-hover)]"
                    href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open WhatsApp chat with ${profile.name || "customer"}`}
                  >
                    <MessageSquare size={16} aria-hidden="true" /> Open WhatsApp
                  </a>
                ) : (
                  <span className="text-xs text-[var(--admin-gold-text)]">No valid WhatsApp number</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
