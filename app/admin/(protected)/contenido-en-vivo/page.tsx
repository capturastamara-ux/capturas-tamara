import Link from "next/link";
import { deleteLiveEventAction } from "@/app/admin/actions";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminUi";
import { adminConfig } from "@/config/admin";
import { liveEventPath } from "@/config/live-content";
import { getAdminLiveEvents } from "@/lib/db/admin";

export default async function AdminLiveEventsPage() {
  const copy = adminConfig.liveEvents;
  const events = await getAdminLiveEvents();

  return (
    <>
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={{ href: copy.newHref, label: copy.newLabel }}
      />

      {events.length === 0 ? (
        <p className="rounded-sm border border-primary/10 bg-background px-4 py-8 text-center text-sm text-muted">
          {copy.empty}
        </p>
      ) : (
        <div className="overflow-hidden rounded-sm border border-primary/10 bg-background">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary/10 text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3 font-normal">{copy.tableTitle}</th>
                <th className="hidden px-4 py-3 font-normal sm:table-cell">
                  {copy.tableSlug}
                </th>
                <th className="px-4 py-3 font-normal">{copy.tableStatus}</th>
                <th className="px-4 py-3 font-normal">{copy.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const href = liveEventPath(event.slug);
                return (
                  <tr
                    key={event.id}
                    className="border-b border-primary/5 last:border-0"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`${copy.href}/${event.id}`}
                        className="font-medium hover:opacity-70"
                      >
                        {event.title}
                      </Link>
                      <p className="mt-1 sm:hidden">
                        {event.published ? (
                          <Link
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:opacity-70"
                          >
                            {copy.tableLinkLabel}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted">
                            {copy.tableLinkDraft}
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="hidden px-4 py-4 sm:table-cell">
                      {event.published ? (
                        <Link
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:opacity-70"
                        >
                          {copy.tableLinkLabel}
                        </Link>
                      ) : (
                        <span className="text-muted">{copy.tableLinkDraft}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge published={event.published} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`${copy.href}/${event.id}`}
                          className="text-xs uppercase tracking-[0.1em] text-primary hover:opacity-70"
                        >
                          {copy.editLabel}
                        </Link>
                        <AdminConfirmDeleteForm
                          action={deleteLiveEventAction}
                          itemLabel={`el evento "${event.title}"`}
                          buttonLabel="Eliminar"
                          variant="link"
                        >
                          <input type="hidden" name="id" value={event.id} />
                        </AdminConfirmDeleteForm>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
