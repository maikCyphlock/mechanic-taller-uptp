
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";

const updateVehicleSchema = z.object({
  plate: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  color: z.string().optional(),
  type: z.enum(["automovil", "camioneta", "camion", "motocicleta", "autobus", "otro"]).optional(),
});

type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

const VehiclePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: vehicle, isLoading } = api.vehicle.getById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  const { mutate } = api.vehicle.update.useMutation();

  const { register, handleSubmit } = useForm<UpdateVehicleInput>({
    resolver: zodResolver(updateVehicleSchema),
    defaultValues: vehicle ? {
      plate: vehicle.plate ?? undefined,
      make: vehicle.make ?? undefined,
      model: vehicle.model ?? undefined,
      year: vehicle.year ?? undefined,
      color: vehicle.color ?? undefined,
      type: vehicle.type ?? undefined,
    } : undefined,
  });

  const onSubmit = (data: UpdateVehicleInput) => {
    mutate({ id: id as string, ...data });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Edit Vehicle</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Plate</label>
          <input {...register("plate")} className="border p-2 w-full" />
        </div>
        <div>
          <label>Make</label>
          <input {...register("make")} className="border p-2 w-full" />
        </div>
        <div>
          <label>Model</label>
          <input {...register("model")} className="border p-2 w-full" />
        </div>
        <div>
          <label>Year</label>
          <input type="number" {...register("year")} className="border p-2 w-full" />
        </div>
        <div>
          <label>Color</label>
          <input {...register("color")} className="border p-2 w-full" />
        </div>
        <div>
          <label>Type</label>
          <select {...register("type")} className="border p-2 w-full">
            <option value="automovil">Automovil</option>
            <option value="camioneta">Camioneta</option>
            <option value="camion">Camion</option>
            <option value="motocicleta">Motocicleta</option>
            <option value="autobus">Autobus</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">
          Save
        </button>
      </form>
    </div>
  );
};

export default VehiclePage;
