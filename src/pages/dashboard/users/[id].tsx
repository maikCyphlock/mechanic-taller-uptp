
import { type NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["user", "admin", "CLIENTE", "GERENTE", "OTRO", "SUPERADMIN"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.date().optional(),
  emailVerified: z.boolean().optional(),
  cedula: z.string().optional(),
  password: z.string().min(6).optional(),
});

type UpdateUserInput = z.infer<typeof updateUserSchema>;

const UserPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  // This is just for the enabled check, we don't use the session data
  const { status } = useSession();

  const { data: user, isLoading, error } = api.user.getById.useQuery(
    { id: id as string },
    { 
      enabled: status === 'authenticated' && !!id,
      retry: false
    }
  );

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Error loading user:', error);
    }
  }, [error]);

  const { mutate } = api.user.updateUser.useMutation({
    onError: (error) => {
      console.error('Error updating user:', error);
    },
  });

  const { register, handleSubmit } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      phone: user.phone ?? undefined,
      role: user.role,
      banned: user.banned ?? false,
      banReason: user.banReason ?? undefined,
      banExpires: user.banExpires ?? undefined,
      emailVerified: !!user.emailVerified,
      cedula: user.cedula ?? undefined,
      password: undefined // Don't pre-fill password
    } : undefined,
  });

  const onSubmit = (data: UpdateUserInput) => {
    mutate({ id: id as string, ...data });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Edit User</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Name</label>
          <input {...register("name")} className="border p-2 w-full" />
        </div>
        <div>
          <label>Email</label>
          <input {...register("email")} className="border p-2 w-full" />
        </div>
        <div>
          <label>Phone</label>
          <input {...register("phone")} className="border p-2 w-full" />
        </div>
        <div>
          <label>Role</label>
          <select {...register("role")} className="border p-2 w-full">
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="CLIENTE">Cliente</option>
            <option value="GERENTE">Gerente</option>
            <option value="OTRO">Otro</option>
            <option value="SUPERADMIN">Superadmin</option>
          </select>
        </div>
        <div>
          <label>Cedula</label>
          <input {...register("cedula")} className="border p-2 w-full" />
        </div>
        <div>
          <label>New Password</label>
          <input type="password" {...register("password")} className="border p-2 w-full" />
        </div>
        <div className="flex items-center">
          <input type="checkbox" {...register("banned")} className="mr-2" />
          <label>Banned</label>
        </div>
        <div>
          <label>Ban Reason</label>
          <input {...register("banReason")} className="border p-2 w-full" />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">
          Save
        </button>
      </form>
    </div>
  );
};

export default UserPage;
