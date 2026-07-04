import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff, Plus, Search, Trash2 } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [deletingPanelist, setDeletingPanelist] = useState<Panelist | null>(
    null,
  );
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
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
  const confirmDelete = async () => {
    if (!deletingPanelist) return;
    if (deleteStep === 1) {
      setDeleteStep(2);
      return;
    }

    try {
      await panelistService.delete(deletingPanelist.id);
      toast.success("Panelist deleted");
      setDeletingPanelist(null);
      setDeleteStep(1);
      queryClient.invalidateQueries({ queryKey: ["panelists"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

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
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <button
          className="btn-secondary h-9 w-9 p-0 text-rose-600 hover:text-rose-700"
          onClick={(event) => {
            event.stopPropagation();
            setDeletingPanelist(row);
            setDeleteStep(1);
          }}
          aria-label="Delete panelist"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
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
      <Modal
        title={
          deleteStep === 1 ? "Delete panelist?" : "Are you absolutely sure?"
        }
        open={Boolean(deletingPanelist)}
        onClose={() => {
          setDeletingPanelist(null);
          setDeleteStep(1);
        }}
      >
        {deletingPanelist ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              {deleteStep === 1
                ? `This will permanently delete ${deletingPanelist.name} (${deletingPanelist.email}) and linked records.`
                : "This action cannot be undone. Do you want to continue?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => {
                  setDeletingPanelist(null);
                  setDeleteStep(1);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary bg-rose-600 hover:bg-rose-700"
                onClick={confirmDelete}
              >
                {deleteStep === 1 ? "Yes, delete" : "Yes, delete permanently"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-10"
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
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
