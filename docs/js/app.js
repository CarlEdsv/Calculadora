// app.js
// Lógica para calcular años/meses/días y la indemnización en el navegador.

// Evita problemas con zonas horarias: parseamos la fecha 'YYYY-MM-DD' en partes
function parseDateIso(value) {
  const parts = value.split('-');
  if (parts.length !== 3) return null;
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Calcula diferencia en años/meses/días (igual que la versión Python)
function calculateYMD(start, end) {
  if (start > end) {
    // intercambiar si están invertidas
    const tmp = start;
    start = end;
    end = tmp;
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    let prevMonth = end.getMonth() - 1;
    let prevYear = end.getFullYear();
    if (prevMonth < 0) {
      prevMonth += 12;
      prevYear -= 1;
    }
    days += daysInMonth(prevYear, prevMonth);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

function formatCurrency(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function computeIndemnization(years, months, days, salary) {
  const yearsFloat = years + months / 12 + days / 365;
  const total = yearsFloat * salary;
  return { yearsFloat, total };
}

function showManualResult(html) {
  document.getElementById('manualResult').innerHTML = html;
}

function showDateResult(html) {
  document.getElementById('dateResult').innerHTML = html;
}

function showCompareMessage(msg, type = 'info') {
  const el = document.getElementById('compareResult');
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}

// Handlers
document.getElementById('manualForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const y = parseInt(document.getElementById('manualYears').value || 0, 10);
  const m = parseInt(document.getElementById('manualMonths').value || 0, 10);
  const d = parseInt(document.getElementById('manualDays').value || 0, 10);
  const s = parseFloat(document.getElementById('manualSalary').value || 0);

  if (s <= 0) {
    showManualResult('<div class="alert alert-warning">Ingresa un salario válido.</div>');
    return;
  }

  const { yearsFloat, total } = computeIndemnization(y, m, d, s);
  const details = `${y} + ${m}/12 + ${d}/365 = ${yearsFloat.toFixed(6)} años`;
  const html = `<div class="alert alert-info text-center mb-0">
      ${y} años, ${m} meses, ${d} días<br>
      <small class="text-muted">${details}</small><br>
      <strong>Indemnización: $${formatCurrency(total)}</strong>
    </div>`;
  showManualResult(html);

  // Si la otra columna ya tiene resultado, comparar
  compareIfPossible(total);
});

document.getElementById('dateForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const startVal = document.getElementById('startDate').value;
  const endVal = document.getElementById('endDate').value;
  const s = parseFloat(document.getElementById('dateSalary').value || 0);

  if (!startVal || !endVal) {
    showDateResult('<div class="alert alert-warning">Selecciona ambas fechas.</div>');
    return;
  }
  if (s <= 0) {
    showDateResult('<div class="alert alert-warning">Ingresa un salario válido.</div>');
    return;
  }

  const start = parseDateIso(startVal);
  const end = parseDateIso(endVal);
  if (!start || !end) {
    showDateResult('<div class="alert alert-warning">Fechas inválidas.</div>');
    return;
  }

  const { years, months, days } = calculateYMD(start, end);
  const { yearsFloat, total } = computeIndemnization(years, months, days, s);

  const details = `${years} + ${months}/12 + ${days}/365 = ${yearsFloat.toFixed(6)} años`;
  const html = `<div class="alert alert-info text-center mb-0">
      ${years} años, ${months} meses, ${days} días<br>
      <small class="text-muted">${details}</small><br>
      <strong>Indemnización: $${formatCurrency(total)}</strong>
    </div>`;
  showDateResult(html);

  compareIfPossible(total);
});

function compareIfPossible(latestTotal) {
  // Obtén valor numérico de ambos resultados si existen
  const manualHtml = document.getElementById('manualResult').innerText || '';
  const dateHtml = document.getElementById('dateResult').innerText || '';

  // Intenta extraer la cifra '$' si ambos están presentes
  const extract = (txt) => {
    const m = txt.match(/\$?([0-9\.,]+\d)/);
    if (!m) return null;
    // eliminar comas y parsear
    return parseFloat(m[1].replace(/,/g, ''));
  };

  const vManual = extract(manualHtml);
  const vDate = extract(dateHtml);

  if (vManual !== null && vDate !== null) {
    const eps = 0.01; // tolerancia centavos
    if (Math.abs(vManual - vDate) <= eps) {
      showCompareMessage('✅ Los resultados coinciden.', 'success');
    } else {
      showCompareMessage(`⚠️ Los resultados NO coinciden. Manual: $${formatCurrency(vManual)} — Fechas: $${formatCurrency(vDate)}.`, 'warning');
    }
  } else {
    // si sólo hay uno, no mostramos nada
    // si deseas, podemos borrar el mensaje
    // document.getElementById('compareResult').innerHTML = '';
  }
}
