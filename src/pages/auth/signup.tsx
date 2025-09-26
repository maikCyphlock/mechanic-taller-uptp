import { type NextPage } from "next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SignupInput = z.infer<typeof signupSchema>;

const SignupPage: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Usamos el método credentials de NextAuth para registrar al usuario
      const result = await signIn('credentials', {
        ...data,
        redirect: false,
        callbackUrl: '/',
        action: 'signup' // Usamos un parámetro personalizado para indicar que es un registro
      });

      if (result?.error) {
        // Manejar errores específicos
        if (result.error.includes('User already exists')) {
          setError('A user with this email already exists.');
        } else {
          setError(result.error || 'An error occurred during signup');
        }
      } else {
        // Redirigir a la página de inicio de sesión con un mensaje de éxito
        await router.push(`/auth/signin?registered=${encodeURIComponent(data.email)}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg bg-white p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">
              <p className="font-medium">Signup Failed</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* Name Field */}
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: "Name is required" })}
              className={`block w-full rounded-md border p-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              className={`block w-full rounded-md border p-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              className={`block w-full rounded-md border p-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-md px-4 py-2 font-medium text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Sign Up'}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
