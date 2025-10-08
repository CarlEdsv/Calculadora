from flask import Flask, render_template, request
from datetime import date

app = Flask(__name__, template_folder="../Frontend")

def calcular_diferencia(fecha1, fecha2):
    """Devuelve diferencia en años, meses y días entre dos fechas."""
    if fecha1 > fecha2:
        fecha1, fecha2 = fecha2, fecha1

    años = fecha2.year - fecha1.year
    meses = fecha2.month - fecha1.month
    dias = fecha2.day - fecha1.day

    if dias < 0:
        meses -= 1
        mes_anterior = fecha2.month - 1 or 12
        año_anterior = fecha2.year if fecha2.month != 1 else fecha2.year - 1
        dias_mes_anterior = (date(año_anterior, mes_anterior % 12 + 1, 1) - date(año_anterior, mes_anterior, 1)).days
        dias += dias_mes_anterior

    if meses < 0:
        años -= 1
        meses += 12

    return años, meses, dias


@app.route("/", methods=["GET", "POST"])
def index():
    resultado_manual = None
    resultado_fechas = None

    if request.method == "POST":
        accion = request.form.get("accion")

        # --- CÁLCULO MANUAL ---
        if accion == "manual":
            try:
                años = int(request.form.get("años", 0))
                meses = int(request.form.get("meses", 0))
                dias = int(request.form.get("dias", 0))
                salario = float(request.form.get("salario", 0))

                total = (años + meses/12 + dias/365) * salario
                resultado_manual = f"{años} años, {meses} meses, {dias} días → Indemnización: ${total:,.2f}"
            except ValueError:
                resultado_manual = "⚠️ Ingresa valores válidos."

        # --- CÁLCULO POR FECHAS ---
        elif accion == "fechas":
            try:
                inicio = request.form.get("inicio")
                fin = request.form.get("fin")
                salario = float(request.form.get("salario_fechas", 0))

                fecha1 = date.fromisoformat(inicio)
                fecha2 = date.fromisoformat(fin)

                años, meses, dias = calcular_diferencia(fecha1, fecha2)
                total = (años + meses/12 + dias/365) * salario
                resultado_fechas = f"{años} años, {meses} meses, {dias} días → Indemnización: ${total:,.2f}"
            except Exception:
                resultado_fechas = "⚠️ Ingresa fechas y salario válidos."

    return render_template("index.html",
                           resultado_manual=resultado_manual,
                           resultado_fechas=resultado_fechas)


if __name__ == "__main__":
    app.run(debug=True)
