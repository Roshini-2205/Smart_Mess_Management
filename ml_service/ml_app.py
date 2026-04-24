# from dotenv import load_dotenv
# import os
# import mysql.connector
# from flask import Flask, jsonify, redirect, url_for, request
# import pandas as pd
# from sklearn.linear_model import LinearRegression
# from flask_cors import CORS

# # Load .env variables
# load_dotenv()

# DB_HOST = os.getenv("DB_HOST")
# DB_USER = os.getenv("DB_USER")
# DB_PASS = os.getenv("DB_PASS")
# DB_NAME = os.getenv("DB_NAME")

# # Connect to MySQL
# db = mysql.connector.connect(
#     host=DB_HOST or "127.0.0.1",
#     user=DB_USER or "root",
#     password=DB_PASS or "",
#     database=DB_NAME or "smart_mess",
#     port=3306,
#     use_pure=True
# )

# app = Flask(__name__)
# CORS(app)

# # Redirect root URL to /predict
# @app.route("/")
# def home():
#     return redirect(url_for('predict'))

# # ------------------- Predict stock usage -------------------
# @app.route("/predict", methods=["GET"])
# def predict():
#     cursor = db.cursor(dictionary=True)
#     cursor.execute("SELECT * FROM stock_usage ORDER BY date")
#     rows = cursor.fetchall()
#     df = pd.DataFrame(rows)

#     predictions = []
#     if df.empty:
#         return jsonify(predictions)

#     # Use the actual column for ingredient
#     for item in df['item'].unique():
#         item_df = df[df['item'] == item].copy()
#         item_df['day_num'] = (pd.to_datetime(item_df['date']) - pd.to_datetime(item_df['date'].min())).dt.days
#         X = item_df[['day_num']]
#         y = item_df['used_kg']

#         if len(item_df) < 2:
#             predicted = y.iloc[-1] if len(y) > 0 else 0
#         else:
#             model = LinearRegression()
#             model.fit(X, y)
#             next_day_num = X['day_num'].max() + 7
#             predicted = model.predict([[next_day_num]])[0]

#         predictions.append({"item": item, "predicted_qty": round(float(predicted), 2)})

#     return jsonify(predictions)

# # ------------------- Meal requirement per hostel -------------------
# @app.route("/api/meal-requirement")
# def meal_requirement():
#     hostel = request.args.get("hostel")
#     cursor = db.cursor(dictionary=True)

#     cursor.execute("""
#         SELECT
#             mp.meal_type,
#             AVG(mp.total_cooked_qty / 
#                 CASE
#                     WHEN mp.meal_type='Breakfast' THEN a.breakfast
#                     WHEN mp.meal_type='Lunch' THEN a.lunch
#                     WHEN mp.meal_type='Dinner' THEN a.dinner
#                 END
#             ) AS per_student,
#             AVG(
#                 CASE
#                     WHEN mp.meal_type='Breakfast' THEN a.breakfast
#                     WHEN mp.meal_type='Lunch' THEN a.lunch
#                     WHEN mp.meal_type='Dinner' THEN a.dinner
#                 END
#             ) AS avg_students
#         FROM meal_production mp
#         JOIN attendance_summary a
#             ON mp.date = a.date
#         WHERE a.hostel=%s
#         AND mp.total_cooked_qty IS NOT NULL
#         GROUP BY mp.meal_type
#     """, (hostel,))

#     rows = cursor.fetchall()
#     result = {}

#     for r in rows:
#         qty = (r['per_student'] or 0) * (r['avg_students'] or 0)
#         result[r['meal_type']] = round(qty, 2)

#     return jsonify(result)

# # ------------------- Menu suggestion -------------------
# @app.route("/api/menu-suggestion")
# def menu_suggestion():
#     hostel = request.args.get("hostel")
#     cursor = db.cursor(dictionary=True)

#     # 1️⃣ Fetch all foods with ingredients, stock, price, and waste
#     cursor.execute("""
#         SELECT 
#             fi.food_name,
#             fi.meal_type,
#             ing.ingredient_name,
#             ing.quantity AS qty_required,
#             s.quantity AS stock_qty,
#             s.price_per_unit,
#             IFNULL(w.avg_waste, 0) AS avg_waste
#         FROM food_items fi
#         JOIN food_ingredients ing ON fi.food_name = ing.food_name
#         LEFT JOIN stock_items s 
#             ON ing.ingredient_name = s.item_name AND s.hostel=%s
#         LEFT JOIN (
#             SELECT ingredient_name, AVG(raw_waste + cooked_waste) AS avg_waste, hostel
#             FROM waste
#             GROUP BY ingredient_name, hostel
#         ) w ON ing.ingredient_name = w.ingredient_name AND w.hostel=%s
#     """, (hostel, hostel))
#     rows = cursor.fetchall()

#     # 2️⃣ Build dish score based on cost, stock, waste
#     dish_scores = {}
#     for r in rows:
#         dish = r["food_name"]
#         meal_type = r["meal_type"]
#         cost = (r["qty_required"] or 0) * (r["price_per_unit"] or 0)
#         waste_penalty = (r["avg_waste"] or 0) * 2  # weight 2
#         stock_penalty = 0 if (r["stock_qty"] or 0) >= (r["qty_required"] or 0) else 50
#         score = cost + waste_penalty + stock_penalty

#         if dish not in dish_scores:
#             dish_scores[dish] = {"meal_type": meal_type, "score": 0, "ingredients": []}

#         dish_scores[dish]["score"] += score
#         dish_scores[dish]["ingredients"].append(r["ingredient_name"])

#     # 3️⃣ Prepare logical dish combinations per meal type
#     meals = {"Breakfast": [], "Lunch": [], "Dinner": []}
#     for meal_type in meals.keys():
#         # Sort by lowest score
#         sorted_dishes = sorted(
#             [d for d, v in dish_scores.items() if v["meal_type"] == meal_type],
#             key=lambda x: dish_scores[x]["score"]
#         )
#         meals[meal_type] = sorted_dishes

#     # 4️⃣ Generate weekly menu with variety (no repeats >2 times)
#     week_menu = {}
#     days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
#     used_count = {dish: 0 for dish in dish_scores}

#     import random
#     random.seed(42)  # reproducible menu

#     for day in days:
#         day_menu = {}
#         for meal_type in ["Breakfast", "Lunch", "Dinner"]:
#             # Pick top 2-3 dishes with lowest score, respecting repeat limit
#             candidates = [d for d in meals[meal_type] if used_count[d] < 2]
#             if not candidates:
#                 candidates = meals[meal_type]  # fallback

#             # Pick logical combination per meal type
#             if meal_type == "Breakfast":
#                 selected = candidates[:2]  # main + side/chutney
#             elif meal_type == "Lunch":
#                 selected = candidates[:2]  # main + curry/rice
#             else:  # Dinner
#                 selected = candidates[:2]  # lighter combination

#             for d in selected:
#                 used_count[d] += 1

#             day_menu[meal_type] = selected

#         week_menu[day] = day_menu

#     return jsonify(week_menu)

# # ------------------- Run app -------------------
# if __name__ == "__main__":
#     app.run(port=5001, debug=True)



from dotenv import load_dotenv
import os
import mysql.connector
from flask import Flask, jsonify, redirect, url_for, request
import pandas as pd
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

import json
# Load .env variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")

# Connect to MySQL
db = mysql.connector.connect(
    host=DB_HOST or "127.0.0.1",
    user=DB_USER or "root",
    password=DB_PASS or "",
    database=DB_NAME or "smart_mess",
    port=3306,
    use_pure=True
)

app = Flask(__name__)
CORS(app)

# Redirect root URL to /predict
@app.route("/")
def home():
    return redirect(url_for('predict'))

# ------------------- Predict stock usage -------------------
@app.route("/predict", methods=["GET"])
def predict():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM stock_usage ORDER BY date")
    rows = cursor.fetchall()

    df = pd.DataFrame(rows)

    predictions = []

    if df.empty:
        return jsonify(predictions)

    # ✅ FIXED COLUMN NAME
    for item in df['item_name'].unique():
        item_df = df[df['item_name'] == item].copy()

        item_df['day_num'] = (
            pd.to_datetime(item_df['date']) -
            pd.to_datetime(item_df['date'].min())
        ).dt.days

        X = item_df[['day_num']]
        y = item_df['used_kg']

        if len(item_df) < 2:
            predicted = y.iloc[-1] if len(y) > 0 else 0
        else:
            model = LinearRegression()
            model.fit(X, y)

            next_day_num = X['day_num'].max() + 7
            predicted = model.predict([[next_day_num]])[0]

        predictions.append({
            "item": item,   # 👈 keep this same as React
            "predicted_qty": round(float(predicted), 2)
        })

    return jsonify(predictions)
# ------------------- Meal requirement per hostel -------------------
@app.route("/api/meal-requirement")
def meal_requirement():
    hostel = request.args.get("hostel")
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            mp.meal,

            AVG(
                CASE
                    WHEN mp.meal='breakfast' AND a.breakfast > 0
                        THEN mp.prepared_count / a.breakfast
                    WHEN mp.meal='lunch' AND a.lunch > 0
                        THEN mp.prepared_count / a.lunch
                    WHEN mp.meal='dinner' AND a.dinner > 0
                        THEN mp.prepared_count / a.dinner
                END
            ) AS per_student,

            AVG(
                CASE
                    WHEN mp.meal='breakfast' THEN a.breakfast
                    WHEN mp.meal='lunch' THEN a.lunch
                    WHEN mp.meal='dinner' THEN a.dinner
                END
            ) AS avg_students

        FROM meal_production mp
        JOIN attendance_summary a
            ON mp.date = a.date

        WHERE a.hostel = %s

        GROUP BY mp.meal
    """, (hostel,))

    rows = cursor.fetchall()

    result = {
        "Breakfast": 0,
        "Lunch": 0,
        "Dinner": 0
    }

    for r in rows:
        per_student = r["per_student"] or 0
        avg_students = r["avg_students"] or 0

        predicted = round(per_student * avg_students, 2)

        # 🔥 convert lowercase → UI format
        meal_name = r["meal"].capitalize()

        result[meal_name] = predicted

    return jsonify(result)

# ------------------- Menu suggestion -------------------
@app.route("/api/menu-suggestion")
def menu_suggestion():
    hostel = request.args.get("hostel")
    cursor = db.cursor(dictionary=True)

    # -------------------------------
    # 1. Get all foods
    # -------------------------------
    cursor.execute("""
        SELECT DISTINCT food_name, meal_type 
        FROM food_items
    """)
    foods = cursor.fetchall()

    food_costs = []

    # -------------------------------
    # 2. Calculate cost for each food
    # -------------------------------
    for f in foods:
        food = f["food_name"]
        meal_type = f["meal_type"]

        cursor.execute("""
            SELECT SUM(quantity * price_per_unit) AS total_cost
            FROM food_ingredients
            WHERE food_name=%s AND hostel=%s
        """, (food, hostel))

        result = cursor.fetchone()
        cost = result["total_cost"] if result["total_cost"] else 9999  # high if missing

        food_costs.append({
            "food": food,
            "meal_type": meal_type,
            "cost": cost
        })
        

    # -------------------------------
    # 3. Sort by lowest cost
    # -------------------------------
    food_costs = sorted(food_costs, key=lambda x: x["cost"])

    # -------------------------------
    # 4. Separate by meal type
    # -------------------------------
    breakfast_foods = [f["food"] for f in food_costs if f["meal_type"] == "Breakfast"]
    lunch_foods = [f["food"] for f in food_costs if f["meal_type"] == "Lunch"]
    dinner_foods = [f["food"] for f in food_costs if f["meal_type"] == "Dinner"]

    import random

    days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

    new_menu = {}


   
    # -------------------------------
    # 5. Generate smart menu
    # -------------------------------
    for day in days:
        new_menu[day] = {
            "breakfast": [{"food_name": random.choice(breakfast_foods[:5]) if breakfast_foods else "Idli"}],
            "lunch": [{"food_name": random.choice(lunch_foods[:5]) if lunch_foods else "Meals"}],
            "dinner": [{"food_name": random.choice(dinner_foods[:5]) if dinner_foods else "Chapati"}],
        }

    return jsonify(new_menu)


# ------------------- Menu insights -------------------
@app.route("/api/menu-insights")
def menu_insights():
    hostel = request.args.get("hostel")
    cursor = db.cursor(dictionary=True)

    # 1️⃣ COST
    cursor.execute("""
        SELECT AVG(quantity * price_per_unit) AS avg_cost
        FROM food_ingredients
        WHERE hostel=%s
    """, (hostel,))
    avg_cost = cursor.fetchone()["avg_cost"] or 0

    # 2️⃣ WASTE
    cursor.execute("""
        SELECT AVG(cooked_waste) AS recent_waste
        FROM waste
        WHERE hostel=%s
        AND waste_date >= CURDATE() - INTERVAL 7 DAY
    """, (hostel,))
    recent = cursor.fetchone()["recent_waste"] or 0

    cursor.execute("""
        SELECT AVG(cooked_waste) AS old_waste
        FROM waste
        WHERE hostel=%s
        AND waste_date BETWEEN CURDATE() - INTERVAL 14 DAY AND CURDATE() - INTERVAL 7 DAY
    """, (hostel,))
    old = cursor.fetchone()["old_waste"] or 0

    waste_reduction = 0
    if old > 0:
        waste_reduction = round(((old - recent) / old) * 100, 2)

    # 3️⃣ STOCK
    cursor.execute("""
        SELECT COUNT(*) AS total FROM stock_items WHERE hostel=%s
    """, (hostel,))
    total = cursor.fetchone()["total"] or 1

    cursor.execute("""
        SELECT COUNT(DISTINCT item_name) AS used
        FROM stock_usage
        WHERE date >= CURDATE() - INTERVAL 7 DAY
    """)
    used = cursor.fetchone()["used"] or 0

    stock_usage = round((used / total) * 100, 2)

    return jsonify({
        "avg_cost": round(avg_cost, 2),
        "waste_reduction": float(waste_reduction),
        "stock_usage": stock_usage
    })

# ------------------- Run app -------------------
if __name__ == "__main__":
    app.run(port=5001, debug=True)