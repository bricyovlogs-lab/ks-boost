import { AuthShell } from "@/components/auth-shell";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = (await searchParams) || {};

  const errorMessage =
    params.error === "invalid_credentials"
      ? "Email ou senha inválidos."
      : params.error === "invalid_data"
        ? "Preencha os dados corretamente."
        : params.error === "server_error"
          ? "Erro interno no login. Verifique o servidor e o banco de dados."
          : null;

  return <AuthShell mode="login" errorMessage={errorMessage} />;
}
