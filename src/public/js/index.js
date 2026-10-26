async function cancelPass(id) {
  const res = await fetch(`/admin/passes/${id}`, { method: "PATCH" });
  if (res.ok) location.reload();
  else alert(`Greška: ${res.status}`);
}

async function deletePass(id) {
  const res = await fetch(`/admin/passes/${id}`, { method: "DELETE" });
  if (res.ok) location.reload();
  else alert(`Greška: ${res.status}`);
}
