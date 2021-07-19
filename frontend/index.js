const templateRow = Hogan.compile(document.querySelector("#template-row").innerHTML);

(async () => {
  const res = await fetch("/api/statuses");
  const places = await res.json();
  places.forEach((place) => {
    place.no = places.indexOf(place) + 1;
    place.updatedAt = place.updatedAt ? moment(new Date(place.updatedAt).toISOString()).format("HH:mm") : "-";
    document.querySelector("#rows").insertAdjacentHTML("beforeend", templateRow.render(place));
  });
})();

document.querySelector("#reload").addEventListener("click", () => location.reload());
