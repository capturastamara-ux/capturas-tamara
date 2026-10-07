import Image from "next/image";
import Link from "next/link";
import { deleteTeamMemberAction } from "@/app/admin/actions";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminUi";
import { adminConfig } from "@/config/admin";
import { teamConfig } from "@/config/team";
import { getAdminTeamMembers } from "@/lib/db/admin";

export default async function AdminTeamPage() {
  const copy = adminConfig.team;
  const members = await getAdminTeamMembers();

  return (
    <>
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        secondaryAction={{
          href: teamConfig.publicPath,
          label: copy.publicPageLabel,
          external: true,
        }}
        action={{ href: copy.newHref, label: copy.newLabel }}
      />

      {members.length === 0 ? (
        <p className="rounded-sm border border-primary/10 bg-background px-4 py-8 text-center text-sm text-muted">
          {copy.empty}
        </p>
      ) : (
        <div className="overflow-hidden rounded-sm border border-primary/10 bg-background">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary/10 text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3 font-normal">{copy.tablePhoto}</th>
                <th className="px-4 py-3 font-normal">{copy.tableName}</th>
                <th className="px-4 py-3 font-normal">{copy.tableStatus}</th>
                <th className="px-4 py-3 font-normal">{copy.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-primary/5 last:border-0"
                >
                  <td className="px-4 py-4">
                    <div className="relative size-12 overflow-hidden rounded-full bg-surface">
                      <Image
                        src={member.photoUrl}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`${copy.href}/${member.id}`}
                      className="font-medium hover:opacity-70"
                    >
                      {member.name}
                    </Link>
                    {member.role ? (
                      <p className="mt-1 text-xs text-muted">{member.role}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge published={member.published} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`${copy.href}/${member.id}`}
                        className="text-xs uppercase tracking-[0.1em] text-primary hover:opacity-70"
                      >
                        {copy.editLabel}
                      </Link>
                      <AdminConfirmDeleteForm
                        action={deleteTeamMemberAction}
                        itemLabel={`el perfil de "${member.name}"`}
                        buttonLabel="Eliminar"
                        variant="link"
                      >
                        <input type="hidden" name="id" value={member.id} />
                      </AdminConfirmDeleteForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
