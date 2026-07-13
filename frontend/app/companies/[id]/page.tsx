import { notFound } from "next/navigation";
import { apiGet, ApiError } from "@/lib/api";
import { CompanyDetail } from "@/lib/types";
import { ContactForm } from "@/components/ContactForm";
import { NoteForm } from "@/components/NoteForm";
import { TagForm } from "@/components/TagForm";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let company: CompanyDetail;
  try {
    company = await apiGet<CompanyDetail>(`/companies/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold">{company.name}</h1>
        {company.description && (
          <p className="mt-2 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
            {company.description}
          </p>
        )}
        {company.websiteUrl && (
          <a
            href={company.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-blue-600 underline"
          >
            {company.websiteUrl}
          </a>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">タグ</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {company.companyTags.map((ct) => (
            <span
              key={ct.tagId}
              className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {ct.tag.name}
            </span>
          ))}
          {company.companyTags.length === 0 && (
            <p className="text-sm text-zinc-500">タグはまだありません</p>
          )}
        </div>
        <TagForm companyId={company.id} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">担当者</h2>
        <ul className="mb-4 flex flex-col gap-2">
          {company.contacts.map((contact) => (
            <li
              key={contact.id}
              className="rounded-md border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-800"
            >
              <p className="font-medium">{contact.name}</p>
              <p className="text-zinc-500">
                {[contact.position, contact.email].filter(Boolean).join(" / ")}
              </p>
            </li>
          ))}
          {company.contacts.length === 0 && (
            <p className="text-sm text-zinc-500">担当者はまだいません</p>
          )}
        </ul>
        <ContactForm companyId={company.id} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">メモ</h2>
        <ul className="mb-4 flex flex-col gap-3">
          {company.notes.map((note) => (
            <li
              key={note.id}
              className="rounded-md border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-800"
            >
              <p className="whitespace-pre-wrap">{note.body}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {note.user.email} ・{" "}
                {new Date(note.createdAt).toLocaleString("ja-JP")}
              </p>
            </li>
          ))}
          {company.notes.length === 0 && (
            <p className="text-sm text-zinc-500">メモはまだありません</p>
          )}
        </ul>
        <NoteForm companyId={company.id} />
      </section>
    </div>
  );
}
