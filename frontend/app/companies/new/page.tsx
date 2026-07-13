import { CompanyForm } from "@/components/CompanyForm";

export default function NewCompanyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">企業を作成</h1>
      <CompanyForm />
    </div>
  );
}
