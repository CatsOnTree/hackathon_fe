import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Search } from "lucide-react";
import { DataTable, type Column } from "../../components/common/DataTable";
import { Modal } from "../../components/common/Modal";
import { PageHeader } from "../../components/common/PageHeader";
import { panelistService } from "../../services/panelistService";
import type { Panelist, PanelistPayload } from "../../types/panelist";
import { getApiErrorMessage } from "../../utils/api";
import { RoleGuard } from "../../utils/roleGuard";

export function PanelistsPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["panelists"],
    queryFn: panelistService.list,
  });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<PanelistPayload>();
  const createPanelist = useMutation({
    mutationFn: panelistService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["panelists"] }),
  });
  const filtered = useMemo(
    () =>
      data.filter((item) =>
        [item.name, item.email, item.domain].some((value) =>
          value.toLowerCase().includes(query.toLowerCase()),
        ),
      ),
    [data, query],
  );
  const columns: Column<Panelist>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <span className="font-medium text-zinc-900">{row.name}</span>
      ),
    },
    { key: "email", header: "Email", render: (row) => row.email },
    { key: "domain", header: "Domain", render: (row) => row.domain },
  ];

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createPanelist.mutateAsync(values);
      toast.success("Panelist created");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  return (
    <>
      <PageHeader
        title="Panelists"
        description="Maintain interviewer details and technical domains."
        actions={
          <RoleGuard requiredRoles={["ADMIN"]}>
            <button className="btn-primary" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Create Panelist
            </button>
          </RoleGuard>
        }
      />
      <label className="relative mb-4 block max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        <input
          className="input pl-9"
          placeholder="Search panelists"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <DataTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        emptyTitle="No panelists found"
      />
      <Modal title="Create Panelist" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.name.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              {...register("email", { required: "Email is required" })}
            />
          </div>
          <div>
            <label className="label">Domain</label>
            <input
              className="input"
              {...register("domain", { required: "Domain is required" })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          <button
            className="btn-primary w-full"
            disabled={createPanelist.isPending}
          >
            {createPanelist.isPending ? "Creating..." : "Create Panelist"}
          </button>
        </form>
      </Modal>
    </>
  );
}
