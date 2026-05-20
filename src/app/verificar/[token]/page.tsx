import VerifyClient from "./verify-client";

export const metadata = {
  title: "Verificar email · mipropina",
};

export default async function VerificarTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <VerifyClient token={token} />
      </div>
    </div>
  );
}
