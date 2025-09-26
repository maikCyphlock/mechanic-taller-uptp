
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";

const updateClientSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  cedula: z.string().optional(),
});

type UpdateClientInput = z.infer<typeof updateClientSchema>;

const ClientPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: client, isLoading } = api.client.getById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  const { mutate } = api.client.update.useMutation();

  const { register, handleSubmit } = useForm<UpdateClientInput>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: client,
  });

  const onSubmit = (data: UpdateClientInput) => {
    mutate({ id: id as string, ...data });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Edit Client</h1>
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
          <label>Address</label>
          <input {...register("address")} className="border p-2 w-full" />
        </div>
        <div>
          <label>City</label>
          <input {...register("city")} className="border p-2 w-full" />
        </div>
        <div>
          <label>State</label>
          <input {...register("state")} className="border p-2 w-full" />
        </div>
        <div>
          <label>Cedula</label>
          <input {...register("cedula")} className="border p-2 w-full" />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">
          Save
        </button>
      </form>
    </div>
  );
};

export default ClientPage;
