import { type NextPage } from "next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

const signupSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

type SignupInput = z.infer<typeof signupSchema>;

const SignupPage: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        name: data.name,
        action: "signup",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push("/");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold">Sign Up</h1>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div>
            <label>Name</label>
            <input
              {...register("name")}
              className="border p-2 w-full"
              disabled={isLoading}
            />
            {errors.name && (
              <div className="text-red-500 text-sm">{errors.name.message}</div>
            )}
          </div>

          <div>
            <label>Email</label>
            <input
              {...register("email")}
              className="border p-2 w-full"
              disabled={isLoading}
            />
            {errors.email && (
              <div className="text-red-500 text-sm">{errors.email.message}</div>
            )}
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              {...register("password")}
              className="border p-2 w-full"
              disabled={isLoading}
            />
            {errors.password && (
              <div className="text-red-500 text-sm">{errors.password.message}</div>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 w-full disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
