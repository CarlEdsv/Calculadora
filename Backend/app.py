from flask import Flask, render_template, request, jsonify

# Indicamos que los templates están en ../templates
app = Flask(__name__, template_folder='../templates', static_folder='../frontend')

# --- Lógica de cálculo ---
def calcular_indemnizacion(salario_mensual, años_trabajados, meses_trabajados):
    salario_diario = salario_mensual / 30
    indemnizacion_anios = salario_diario * 30 * años_trabajados

    if meses_trabajados > 3:
        indemnizacion_fraccion = salario_diario * 30 * (meses_trabajados / 12)
    else:
        indemnizacion_fraccion = 0

    total_indemnizacion = indemnizacion_anios + indemnizacion_fraccion

    minimo_legal = salario_diario * 15
    if total_indemnizacion < minimo_legal:
        total_indemnizacion = minimo_legal

    return {
        "salario_diario": round(salario_diario, 2),
        "indemnizacion_anios": round(indemnizacion_anios, 2),
        "indemnizacion_fraccion": round(indemnizacion_fraccion, 2),
        "total_indemnizacion": round(total_indemnizacion, 2)
    }

# --- Rutas Flask ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calcular', methods=['POST'])
def calcular():
    data = request.get_json()
    salario = float(data['salario'])
    años = int(data['años'])
    meses = int(data['meses'])
    resultado = calcular_indemnizacion(salario, años, meses)
    return jsonify(resultado)

if __name__ == '__main__':
    app.run(debug=True)

