async function calcular() {
    const salario = document.getElementById('salario').value;
    const años = document.getElementById('años').value;
    const meses = document.getElementById('meses').value;
    const dias = document.getElementById('dias').value;

    try {
        const response = await fetch('/calcular', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ salario, años, meses, dias})
        });

        const data = await response.json();
        document.getElementById('resultado').innerText = `
Salario diario: $${data.salario_diario}
Indemnización por años completos: $${data.indemnizacion_anios}
Indemnización por fracción: $${data.indemnizacion_fraccion}
Total indemnización: $${data.total_indemnizacion}
`;
    } catch (error) {
        alert("Error al calcular la indemnización. Verifique los valores ingresados.");
    }
}
