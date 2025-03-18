const mealPlans = {
    Anything: {
        "100-200": {
            2: ["Breakfast: Oatmeal with berries (150 cal)", "Dinner: Grilled chicken with veggies (180 cal)"],
            3: ["Breakfast: Oatmeal with berries (150 cal)", "Lunch: Turkey sandwich (200 cal)", "Dinner: Grilled chicken with veggies (180 cal)"],
            4: ["Breakfast: Oatmeal with berries (150 cal)", "Snack: Greek yogurt (120 cal)", "Lunch: Turkey sandwich (200 cal)", "Dinner: Grilled chicken with veggies (180 cal)"],
            5: ["Breakfast: Oatmeal with berries (150 cal)", "Snack: Greek yogurt (120 cal)", "Lunch: Turkey sandwich (200 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled chicken with veggies (180 cal)"]
        },
        "200-300": {
            2: ["Breakfast: Pancakes with syrup (250 cal)", "Dinner: Spaghetti with meatballs (280 cal)"],
            3: ["Breakfast: Pancakes with syrup (250 cal)", "Lunch: Caesar salad with grilled chicken (220 cal)", "Dinner: Spaghetti with meatballs (280 cal)"],
            4: ["Breakfast: Pancakes with syrup (250 cal)", "Snack: Granola bar (150 cal)", "Lunch: Caesar salad with grilled chicken (220 cal)", "Dinner: Spaghetti with meatballs (280 cal)"],
            5: ["Breakfast: Pancakes with syrup (250 cal)", "Snack: Granola bar (150 cal)", "Lunch: Caesar salad with grilled chicken (220 cal)", "Snack: Apple (80 cal)", "Dinner: Spaghetti with meatballs (280 cal)"]
        },
        "300-400": {
            2: ["Breakfast: French toast (350 cal)", "Dinner: Beef lasagna (380 cal)"],
            3: ["Breakfast: French toast (350 cal)", "Lunch: Chicken wrap (320 cal)", "Dinner: Beef lasagna (380 cal)"],
            4: ["Breakfast: French toast (350 cal)", "Snack: Smoothie bowl (180 cal)", "Lunch: Chicken wrap (320 cal)", "Dinner: Beef lasagna (380 cal)"],
            5: ["Breakfast: French toast (350 cal)", "Snack: Smoothie bowl (180 cal)", "Lunch: Chicken wrap (320 cal)", "Snack: Apple (80 cal)", "Dinner: Beef lasagna (380 cal)"]
        },
        "400-500": {
            2: ["Breakfast: Scrambled eggs with bacon (450 cal)", "Dinner: Grilled steak with mashed potatoes (480 cal)"],
            3: ["Breakfast: Scrambled eggs with bacon (450 cal)", "Lunch: Chicken Caesar wrap (420 cal)", "Dinner: Grilled steak with mashed potatoes (480 cal)"],
            4: ["Breakfast: Scrambled eggs with bacon (450 cal)", "Snack: Protein shake (200 cal)", "Lunch: Chicken Caesar wrap (420 cal)", "Dinner: Grilled steak with mashed potatoes (480 cal)"],
            5: ["Breakfast: Scrambled eggs with bacon (450 cal)", "Snack: Protein shake (200 cal)", "Lunch: Chicken Caesar wrap (420 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled steak with mashed potatoes (480 cal)"]
        },
        "500-600": {
            2: ["Breakfast: Avocado toast with eggs (550 cal)", "Dinner: Grilled salmon with rice (580 cal)"],
            3: ["Breakfast: Avocado toast with eggs (550 cal)", "Lunch: Beef burger with fries (520 cal)", "Dinner: Grilled salmon with rice (580 cal)"],
            4: ["Breakfast: Avocado toast with eggs (550 cal)", "Snack: Trail mix (250 cal)", "Lunch: Beef burger with fries (520 cal)", "Dinner: Grilled salmon with rice (580 cal)"],
            5: ["Breakfast: Avocado toast with eggs (550 cal)", "Snack: Trail mix (250 cal)", "Lunch: Beef burger with fries (520 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled salmon with rice (580 cal)"]
        },
        "600-700": {
            2: ["Breakfast: Protein pancakes with syrup (650 cal)", "Dinner: Grilled chicken with sweet potatoes (680 cal)"],
            3: ["Breakfast: Protein pancakes with syrup (650 cal)", "Lunch: Tuna salad wrap (620 cal)", "Dinner: Grilled chicken with sweet potatoes (680 cal)"],
            4: ["Breakfast: Protein pancakes with syrup (650 cal)", "Snack: Hard-boiled eggs (150 cal)", "Lunch: Tuna salad wrap (620 cal)", "Dinner: Grilled chicken with sweet potatoes (680 cal)"],
            5: ["Breakfast: Protein pancakes with syrup (650 cal)", "Snack: Hard-boiled eggs (150 cal)", "Lunch: Tuna salad wrap (620 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled chicken with sweet potatoes (680 cal)"]
        },
        "700-800": {
            2: ["Breakfast: Breakfast burrito with eggs and sausage (750 cal)", "Dinner: Beef stir-fry with rice (780 cal)"],
            3: ["Breakfast: Breakfast burrito with eggs and sausage (750 cal)", "Lunch: Grilled chicken pasta (720 cal)", "Dinner: Beef stir-fry with rice (780 cal)"],
            4: ["Breakfast: Breakfast burrito with eggs and sausage (750 cal)", "Snack: Protein bar (200 cal)", "Lunch: Grilled chicken pasta (720 cal)", "Dinner: Beef stir-fry with rice (780 cal)"],
            5: ["Breakfast: Breakfast burrito with eggs and sausage (750 cal)", "Snack: Protein bar (200 cal)", "Lunch: Grilled chicken pasta (720 cal)", "Snack: Apple (80 cal)", "Dinner: Beef stir-fry with rice (780 cal)"]
        },
        "800-900": {
            2: ["Breakfast: Full English breakfast (850 cal)", "Dinner: Grilled salmon with quinoa and veggies (880 cal)"],
            3: ["Breakfast: Full English breakfast (850 cal)", "Lunch: Beef and vegetable stew (820 cal)", "Dinner: Grilled salmon with quinoa and veggies (880 cal)"],
            4: ["Breakfast: Full English breakfast (850 cal)", "Snack: Greek yogurt with granola (200 cal)", "Lunch: Beef and vegetable stew (820 cal)", "Dinner: Grilled salmon with quinoa and veggies (880 cal)"],
            5: ["Breakfast: Full English breakfast (850 cal)", "Snack: Greek yogurt with granola (200 cal)", "Lunch: Beef and vegetable stew (820 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled salmon with quinoa and veggies (880 cal)"]
        },
        "900-1000": {
            2: ["Breakfast: Pancakes with syrup and bacon (950 cal)", "Dinner: Ribeye steak with mashed potatoes (980 cal)"],
            3: ["Breakfast: Pancakes with syrup and bacon (950 cal)", "Lunch: Chicken Alfredo pasta (920 cal)", "Dinner: Ribeye steak with mashed potatoes (980 cal)"],
            4: ["Breakfast: Pancakes with syrup and bacon (950 cal)", "Snack: Protein shake (200 cal)", "Lunch: Chicken Alfredo pasta (920 cal)", "Dinner: Ribeye steak with mashed potatoes (980 cal)"],
            5: ["Breakfast: Pancakes with syrup and bacon (950 cal)", "Snack: Protein shake (200 cal)", "Lunch: Chicken Alfredo pasta (920 cal)", "Snack: Apple (80 cal)", "Dinner: Ribeye steak with mashed potatoes (980 cal)"]
        },
        "1000-1100": {
            2: ["Breakfast: Scrambled eggs with avocado toast (1050 cal)", "Dinner: Grilled chicken with sweet potatoes (1080 cal)"],
            3: ["Breakfast: Scrambled eggs with avocado toast (1050 cal)", "Lunch: Beef burger with fries (1020 cal)", "Dinner: Grilled chicken with sweet potatoes (1080 cal)"],
            4: ["Breakfast: Scrambled eggs with avocado toast (1050 cal)", "Snack: Trail mix (250 cal)", "Lunch: Beef burger with fries (1020 cal)", "Dinner: Grilled chicken with sweet potatoes (1080 cal)"],
            5: ["Breakfast: Scrambled eggs with avocado toast (1050 cal)", "Snack: Trail mix (250 cal)", "Lunch: Beef burger with fries (1020 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled chicken with sweet potatoes (1080 cal)"]
        },
        "1100-1200": {
            2: ["Breakfast: Protein pancakes with syrup (1150 cal)", "Dinner: Grilled salmon with rice (1180 cal)"],
            3: ["Breakfast: Protein pancakes with syrup (1150 cal)", "Lunch: Tuna salad wrap (1120 cal)", "Dinner: Grilled salmon with rice (1180 cal)"],
            4: ["Breakfast: Protein pancakes with syrup (1150 cal)", "Snack: Hard-boiled eggs (150 cal)", "Lunch: Tuna salad wrap (1120 cal)", "Dinner: Grilled salmon with rice (1180 cal)"],
            5: ["Breakfast: Protein pancakes with syrup (1150 cal)", "Snack: Hard-boiled eggs (150 cal)", "Lunch: Tuna salad wrap (1120 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled salmon with rice (1180 cal)"]
        },
        "1200-1300": {
            2: ["Breakfast: Breakfast burrito with eggs and sausage (1250 cal)", "Dinner: Beef stir-fry with rice (1280 cal)"],
            3: ["Breakfast: Breakfast burrito with eggs and sausage (1250 cal)", "Lunch: Grilled chicken pasta (1220 cal)", "Dinner: Beef stir-fry with rice (1280 cal)"],
            4: ["Breakfast: Breakfast burrito with eggs and sausage (1250 cal)", "Snack: Protein bar (200 cal)", "Lunch: Grilled chicken pasta (1220 cal)", "Dinner: Beef stir-fry with rice (1280 cal)"],
            5: ["Breakfast: Breakfast burrito with eggs and sausage (1250 cal)", "Snack: Protein bar (200 cal)", "Lunch: Grilled chicken pasta (1220 cal)", "Snack: Apple (80 cal)", "Dinner: Beef stir-fry with rice (1280 cal)"]
        },
        "1300-1400": {
            2: ["Breakfast: Full English breakfast (1350 cal)", "Dinner: Grilled salmon with quinoa and veggies (1380 cal)"],
            3: ["Breakfast: Full English breakfast (1350 cal)", "Lunch: Beef and vegetable stew (1320 cal)", "Dinner: Grilled salmon with quinoa and veggies (1380 cal)"],
            4: ["Breakfast: Full English breakfast (1350 cal)", "Snack: Greek yogurt with granola (200 cal)", "Lunch: Beef and vegetable stew (1320 cal)", "Dinner: Grilled salmon with quinoa and veggies (1380 cal)"],
            5: ["Breakfast: Full English breakfast (1350 cal)", "Snack: Greek yogurt with granola (200 cal)", "Lunch: Beef and vegetable stew (1320 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled salmon with quinoa and veggies (1380 cal)"]
        },
        "1400-1500": {
            2: ["Breakfast: Pancakes with syrup and bacon (1450 cal)", "Dinner: Ribeye steak with mashed potatoes (1480 cal)"],
            3: ["Breakfast: Pancakes with syrup and bacon (1450 cal)", "Lunch: Chicken Alfredo pasta (1420 cal)", "Dinner: Ribeye steak with mashed potatoes (1480 cal)"],
            4: ["Breakfast: Pancakes with syrup and bacon (1450 cal)", "Snack: Protein shake (200 cal)", "Lunch: Chicken Alfredo pasta (1420 cal)", "Dinner: Ribeye steak with mashed potatoes (1480 cal)"],
            5: ["Breakfast: Pancakes with syrup and bacon (1450 cal)", "Snack: Protein shake (200 cal)", "Lunch: Chicken Alfredo pasta (1420 cal)", "Snack: Apple (80 cal)", "Dinner: Ribeye steak with mashed potatoes (1480 cal)"]
        },
        "1500-1600": {
            2: ["Breakfast: Scrambled eggs with avocado toast (1550 cal)", "Dinner: Grilled chicken with sweet potatoes (1580 cal)"],
            3: ["Breakfast: Scrambled eggs with avocado toast (1550 cal)", "Lunch: Beef burger with fries (1520 cal)", "Dinner: Grilled chicken with sweet potatoes (1580 cal)"],
            4: ["Breakfast: Scrambled eggs with avocado toast (1550 cal)", "Snack: Trail mix (250 cal)", "Lunch: Beef burger with fries (1520 cal)", "Dinner: Grilled chicken with sweet potatoes (1580 cal)"],
            5: ["Breakfast: Scrambled eggs with avocado toast (1550 cal)", "Snack: Trail mix (250 cal)", "Lunch: Beef burger with fries (1520 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled chicken with sweet potatoes (1580 cal)"]
        },
        "1600-1700": {
            2: ["Breakfast: Protein pancakes with syrup (1650 cal)", "Dinner: Grilled salmon with rice (1680 cal)"],
            3: ["Breakfast: Protein pancakes with syrup (1650 cal)", "Lunch: Tuna salad wrap (1620 cal)", "Dinner: Grilled salmon with rice (1680 cal)"],
            4: ["Breakfast: Protein pancakes with syrup (1650 cal)", "Snack: Hard-boiled eggs (150 cal)", "Lunch: Tuna salad wrap (1620 cal)", "Dinner: Grilled salmon with rice (1680 cal)"],
            5: ["Breakfast: Protein pancakes with syrup (1650 cal)", "Snack: Hard-boiled eggs (150 cal)", "Lunch: Tuna salad wrap (1620 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled salmon with rice (1680 cal)"]
        },
        "1700-1800": {
            2: ["Breakfast: Breakfast burrito with eggs and sausage (1750 cal)", "Dinner: Beef stir-fry with rice (1780 cal)"],
            3: ["Breakfast: Breakfast burrito with eggs and sausage (1750 cal)", "Lunch: Grilled chicken pasta (1720 cal)", "Dinner: Beef stir-fry with rice (1780 cal)"],
            4: ["Breakfast: Breakfast burrito with eggs and sausage (1750 cal)", "Snack: Protein bar (200 cal)", "Lunch: Grilled chicken pasta (1720 cal)", "Dinner: Beef stir-fry with rice (1780 cal)"],
            5: ["Breakfast: Breakfast burrito with eggs and sausage (1750 cal)", "Snack: Protein bar (200 cal)", "Lunch: Grilled chicken pasta (1720 cal)", "Snack: Apple (80 cal)", "Dinner: Beef stir-fry with rice (1780 cal)"]
        },
        "1800-1900": {
            2: ["Breakfast: Full English breakfast (1850 cal)", "Dinner: Grilled salmon with quinoa and veggies (1880 cal)"],
            3: ["Breakfast: Full English breakfast (1850 cal)", "Lunch: Beef and vegetable stew (1820 cal)", "Dinner: Grilled salmon with quinoa and veggies (1880 cal)"],
            4: ["Breakfast: Full English breakfast (1850 cal)", "Snack: Greek yogurt with granola (200 cal)", "Lunch: Beef and vegetable stew (1820 cal)", "Dinner: Grilled salmon with quinoa and veggies (1880 cal)"],
            5: ["Breakfast: Full English breakfast (1850 cal)", "Snack: Greek yogurt with granola (200 cal)", "Lunch: Beef and vegetable stew (1820 cal)", "Snack: Apple (80 cal)", "Dinner: Grilled salmon with quinoa and veggies (1880 cal)"]
        },
        "1900-2000": {
            2: ["Breakfast: Pancakes with syrup and bacon (1950 cal)", "Dinner: Ribeye steak with mashed potatoes (1980 cal)"],
            3: ["Breakfast: Pancakes with syrup and bacon (1950 cal)", "Lunch: Chicken Alfredo pasta (1920 cal)", "Dinner: Ribeye steak with mashed potatoes (1980 cal)"],
            4: ["Breakfast: Pancakes with syrup and bacon (1950 cal)", "Snack: Protein shake (200 cal)", "Lunch: Chicken Alfredo pasta (1920 cal)", "Dinner: Ribeye steak with mashed potatoes (1980 cal)"],
            5: ["Breakfast: Pancakes with syrup and bacon (1950 cal)", "Snack: Protein shake (200 cal)", "Lunch: Chicken Alfredo pasta (1920 cal)", "Snack: Apple (80 cal)", "Dinner: Ribeye steak with mashed potatoes (1980 cal)"]
        }
    },
                    
Keto: {
    // Existing ranges
    "400-500": {
        2: ["Breakfast: Keto avocado and egg bowl (450 cal)", "Dinner: Grilled steak with garlic butter (480 cal)"],
        3: ["Breakfast: Keto avocado and egg bowl (450 cal)", "Lunch: Cobb salad with ranch dressing (420 cal)", "Dinner: Grilled steak with garlic butter (480 cal)"],
        4: ["Breakfast: Keto avocado and egg bowl (450 cal)", "Snack: Cheese and nuts (200 cal)", "Lunch: Cobb salad with ranch dressing (420 cal)", "Dinner: Grilled steak with garlic butter (480 cal)"],
        5: ["Breakfast: Keto avocado and egg bowl (450 cal)", "Snack: Cheese and nuts (200 cal)", "Lunch: Cobb salad with ranch dressing (420 cal)", "Snack: Olives (50 cal)", "Dinner: Grilled steak with garlic butter (480 cal)"]
    },
    "500-600": {
        2: ["Breakfast: Keto pancakes with bacon (550 cal)", "Dinner: Grilled salmon with asparagus and hollandaise (580 cal)"],
        3: ["Breakfast: Keto pancakes with bacon (550 cal)", "Lunch: Chicken Caesar salad with parmesan (520 cal)", "Dinner: Grilled salmon with asparagus and hollandaise (580 cal)"],
        4: ["Breakfast: Keto pancakes with bacon (550 cal)", "Snack: Keto fat bombs (250 cal)", "Lunch: Chicken Caesar salad with parmesan (520 cal)", "Dinner: Grilled salmon with asparagus and hollandaise (580 cal)"],
        5: ["Breakfast: Keto pancakes with bacon (550 cal)", "Snack: Keto fat bombs (250 cal)", "Lunch: Chicken Caesar salad with parmesan (520 cal)", "Snack: Cucumber slices (30 cal)", "Dinner: Grilled salmon with asparagus and hollandaise (580 cal)"]
    },
    "700-800": {
        2: ["Breakfast: Keto breakfast burrito with sausage (750 cal)", "Dinner: Beef stir-fry with cauliflower rice (780 cal)"],
        3: ["Breakfast: Keto breakfast burrito with sausage (750 cal)", "Lunch: Grilled chicken with avocado and cheese (720 cal)", "Dinner: Beef stir-fry with cauliflower rice (780 cal)"],
        4: ["Breakfast: Keto breakfast burrito with sausage (750 cal)", "Snack: Keto protein bar (200 cal)", "Lunch: Grilled chicken with avocado and cheese (720 cal)", "Dinner: Beef stir-fry with cauliflower rice (780 cal)"],
        5: ["Breakfast: Keto breakfast burrito with sausage (750 cal)", "Snack: Keto protein bar (200 cal)", "Lunch: Grilled chicken with avocado and cheese (720 cal)", "Snack: Celery with cream cheese (50 cal)", "Dinner: Beef stir-fry with cauliflower rice (780 cal)"]
    },
    // Missing ranges
    "100-200": {
        2: ["Snack: Hard-boiled eggs (150 cal)", "Snack: Cheese stick (50 cal)"],
        3: ["Snack: Hard-boiled eggs (150 cal)", "Snack: Cheese stick (50 cal)", "Snack: Olives (30 cal)"],
        4: ["Snack: Hard-boiled eggs (150 cal)", "Snack: Cheese stick (50 cal)", "Snack: Olives (30 cal)", "Snack: Cucumber slices (20 cal)"],
        5: ["Snack: Hard-boiled eggs (150 cal)", "Snack: Cheese stick (50 cal)", "Snack: Olives (30 cal)", "Snack: Cucumber slices (20 cal)", "Snack: Celery (10 cal)"]
    },
    "200-300": {
        2: ["Breakfast: Keto coffee with butter (200 cal)", "Snack: Almonds (100 cal)"],
        3: ["Breakfast: Keto coffee with butter (200 cal)", "Snack: Almonds (100 cal)", "Snack: Cheese cubes (50 cal)"],
        4: ["Breakfast: Keto coffee with butter (200 cal)", "Snack: Almonds (100 cal)", "Snack: Cheese cubes (50 cal)", "Snack: Olives (30 cal)"],
        5: ["Breakfast: Keto coffee with butter (200 cal)", "Snack: Almonds (100 cal)", "Snack: Cheese cubes (50 cal)", "Snack: Olives (30 cal)", "Snack: Cucumber slices (20 cal)"]
    },
    "300-400": {
        2: ["Breakfast: Keto smoothie with avocado (300 cal)", "Snack: Cheese and nuts (100 cal)"],
        3: ["Breakfast: Keto smoothie with avocado (300 cal)", "Snack: Cheese and nuts (100 cal)", "Snack: Olives (30 cal)"],
        4: ["Breakfast: Keto smoothie with avocado (300 cal)", "Snack: Cheese and nuts (100 cal)", "Snack: Olives (30 cal)", "Snack: Cucumber slices (20 cal)"],
        5: ["Breakfast: Keto smoothie with avocado (300 cal)", "Snack: Cheese and nuts (100 cal)", "Snack: Olives (30 cal)", "Snack: Cucumber slices (20 cal)", "Snack: Celery (10 cal)"]
    },
    // Continue up to 1900-2000
},
Mediterranean: {
    // Existing ranges
    "400-500": {
        2: ["Breakfast: Shakshuka with feta (450 cal)", "Dinner: Grilled lamb chops with tabbouleh (480 cal)"],
        3: ["Breakfast: Shakshuka with feta (450 cal)", "Lunch: Falafel wrap with tahini (420 cal)", "Dinner: Grilled lamb chops with tabbouleh (480 cal)"],
        4: ["Breakfast: Shakshuka with feta (450 cal)", "Snack: Stuffed grape leaves (200 cal)", "Lunch: Falafel wrap with tahini (420 cal)", "Dinner: Grilled lamb chops with tabbouleh (480 cal)"],
        5: ["Breakfast: Shakshuka with feta (450 cal)", "Snack: Stuffed grape leaves (200 cal)", "Lunch: Falafel wrap with tahini (420 cal)", "Snack: Orange slices (60 cal)", "Dinner: Grilled lamb chops with tabbouleh (480 cal)"]
    },
    "500-600": {
        2: ["Breakfast: Avocado toast with smoked salmon (550 cal)", "Dinner: Grilled fish with quinoa and veggies (580 cal)"],
        3: ["Breakfast: Avocado toast with smoked salmon (550 cal)", "Lunch: Greek salad with grilled chicken (520 cal)", "Dinner: Grilled fish with quinoa and veggies (580 cal)"],
        4: ["Breakfast: Avocado toast with smoked salmon (550 cal)", "Snack: Tzatziki with pita (250 cal)", "Lunch: Greek salad with grilled chicken (520 cal)", "Dinner: Grilled fish with quinoa and veggies (580 cal)"],
        5: ["Breakfast: Avocado toast with smoked salmon (550 cal)", "Snack: Tzatziki with pita (250 cal)", "Lunch: Greek salad with grilled chicken (520 cal)", "Snack: Grapes (60 cal)", "Dinner: Grilled fish with quinoa and veggies (580 cal)"]
    },
    "700-800": {
        2: ["Breakfast: Mediterranean omelette with feta (750 cal)", "Dinner: Moussaka with Greek salad (780 cal)"],
        3: ["Breakfast: Mediterranean omelette with feta (750 cal)", "Lunch: Grilled chicken souvlaki with tzatziki (720 cal)", "Dinner: Moussaka with Greek salad (780 cal)"],
        4: ["Breakfast: Mediterranean omelette with feta (750 cal)", "Snack: Hummus with veggies (200 cal)", "Lunch: Grilled chicken souvlaki with tzatziki (720 cal)", "Dinner: Moussaka with Greek salad (780 cal)"],
        5: ["Breakfast: Mediterranean omelette with feta (750 cal)", "Snack: Hummus with veggies (200 cal)", "Lunch: Grilled chicken souvlaki with tzatziki (720 cal)", "Snack: Olives (50 cal)", "Dinner: Moussaka with Greek salad (780 cal)"]
    },
    // Missing ranges
    "100-200": {
        2: ["Snack: Olives (100 cal)", "Snack: Cucumber slices (50 cal)"],
        3: ["Snack: Olives (100 cal)", "Snack: Cucumber slices (50 cal)", "Snack: Tomato slices (30 cal)"],
        4: ["Snack: Olives (100 cal)", "Snack: Cucumber slices (50 cal)", "Snack: Tomato slices (30 cal)", "Snack: Bell pepper strips (20 cal)"],
        5: ["Snack: Olives (100 cal)", "Snack: Cucumber slices (50 cal)", "Snack: Tomato slices (30 cal)", "Snack: Bell pepper strips (20 cal)", "Snack: Carrot sticks (10 cal)"]
    },
    "200-300": {
        2: ["Breakfast: Greek yogurt with honey (200 cal)", "Snack: Almonds (100 cal)"],
        3: ["Breakfast: Greek yogurt with honey (200 cal)", "Snack: Almonds (100 cal)", "Snack: Olives (30 cal)"],
        4: ["Breakfast: Greek yogurt with honey (200 cal)", "Snack: Almonds (100 cal)", "Snack: Olives (30 cal)", "Snack: Cucumber slices (20 cal)"],
        5: ["Breakfast: Greek yogurt with honey (200 cal)", "Snack: Almonds (100 cal)", "Snack: Olives (30 cal)", "Snack: Cucumber slices (20 cal)", "Snack: Carrot sticks (10 cal)"]
    },
    "300-400": {
        2: ["Breakfast: Mediterranean smoothie with berries (300 cal)", "Snack: Hummus with veggies (100 cal)"],
        3: ["Breakfast: Mediterranean smoothie with berries (300 cal)", "Snack: Hummus with veggies (100 cal)", "Snack: Olives (30 cal)"],
        4: ["Breakfast: Mediterranean smoothie with berries (300 cal)", "Snack: Hummus with veggies (100 cal)", "Snack: Olives (30 cal)", "Snack: Cucumber slices (20 cal)"],
        5: ["Breakfast: Mediterranean smoothie with berries (300 cal)", "Snack: Hummus with veggies (100 cal)", "Snack: Olives (30 cal)", "Snack: Cucumber slices (20 cal)", "Snack: Carrot sticks (10 cal)"]
    },
    // Continue up to 1900-2000
},
Paleo: {
    // Existing ranges
    "400-500": {
        2: ["Breakfast: Paleo breakfast skillet with sweet potatoes (450 cal)", "Dinner: Grilled steak with roasted veggies (480 cal)"],
        3: ["Breakfast: Paleo breakfast skillet with sweet potatoes (450 cal)", "Lunch: Chicken and avocado salad (420 cal)", "Dinner: Grilled steak with roasted veggies (480 cal)"],
        4: ["Breakfast: Paleo breakfast skillet with sweet potatoes (450 cal)", "Snack: Trail mix with nuts and seeds (200 cal)", "Lunch: Chicken and avocado salad (420 cal)", "Dinner: Grilled steak with roasted veggies (480 cal)"],
        5: ["Breakfast: Paleo breakfast skillet with sweet potatoes (450 cal)", "Snack: Trail mix with nuts and seeds (200 cal)", "Lunch: Chicken and avocado salad (420 cal)", "Snack: Apple slices (60 cal)", "Dinner: Grilled steak with roasted veggies (480 cal)"]
    },
    "500-600": {
        2: ["Breakfast: Paleo pancakes with almond butter (550 cal)", "Dinner: Grilled salmon with sweet potato mash (580 cal)"],
        3: ["Breakfast: Paleo pancakes with almond butter (550 cal)", "Lunch: Beef and veggie stir-fry (520 cal)", "Dinner: Grilled salmon with sweet potato mash (580 cal)"],
        4: ["Breakfast: Paleo pancakes with almond butter (550 cal)", "Snack: Hard-boiled eggs (150 cal)", "Lunch: Beef and veggie stir-fry (520 cal)", "Dinner: Grilled salmon with sweet potato mash (580 cal)"],
        5: ["Breakfast: Paleo pancakes with almond butter (550 cal)", "Snack: Hard-boiled eggs (150 cal)", "Lunch: Beef and veggie stir-fry (520 cal)", "Snack: Carrot sticks (30 cal)", "Dinner: Grilled salmon with sweet potato mash (580 cal)"]
    },
    "700-800": {
        2: ["Breakfast: Paleo breakfast burrito with eggs and sausage (750 cal)", "Dinner: Beef stew with root veggies (780 cal)"],
        3: ["Breakfast: Paleo breakfast burrito with eggs and sausage (750 cal)", "Lunch: Grilled chicken with roasted veggies (720 cal)", "Dinner: Beef stew with root veggies (780 cal)"],
        4: ["Breakfast: Paleo breakfast burrito with eggs and sausage (750 cal)", "Snack: Almond butter with celery (200 cal)", "Lunch: Grilled chicken with roasted veggies (720 cal)", "Dinner: Beef stew with root veggies (780 cal)"],
        5: ["Breakfast: Paleo breakfast burrito with eggs and sausage (750 cal)", "Snack: Almond butter with celery (200 cal)", "Lunch: Grilled chicken with roasted veggies (720 cal)", "Snack: Berries (50 cal)", "Dinner: Beef stew with root veggies (780 cal)"]
    },
    // Missing ranges
    "100-200": {
        2: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)"],
        3: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)", "Snack: Celery (30 cal)"],
        4: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)", "Snack: Celery (30 cal)", "Snack: Cucumber slices (20 cal)"],
        5: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)", "Snack: Celery (30 cal)", "Snack: Cucumber slices (20 cal)", "Snack: Bell pepper strips (10 cal)"]
    },
    "200-300": {
        2: ["Breakfast: Paleo smoothie with berries (200 cal)", "Snack: Almonds (100 cal)"],
        3: ["Breakfast: Paleo smoothie with berries (200 cal)", "Snack: Almonds (100 cal)", "Snack: Apple slices (50 cal)"],
        4: ["Breakfast: Paleo smoothie with berries (200 cal)", "Snack: Almonds (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)"],
        5: ["Breakfast: Paleo smoothie with berries (200 cal)", "Snack: Almonds (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)", "Snack: Celery (20 cal)"]
    },
    "300-400": {
        2: ["Breakfast: Paleo omelette with veggies (300 cal)", "Snack: Trail mix with nuts (100 cal)"],
        3: ["Breakfast: Paleo omelette with veggies (300 cal)", "Snack: Trail mix with nuts (100 cal)", "Snack: Apple slices (50 cal)"],
        4: ["Breakfast: Paleo omelette with veggies (300 cal)", "Snack: Trail mix with nuts (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)"],
        5: ["Breakfast: Paleo omelette with veggies (300 cal)", "Snack: Trail mix with nuts (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)", "Snack: Celery (20 cal)"]
    },
    // Continue up to 1900-2000
},
Vegan: {
    // Existing ranges
    "400-500": {
        2: ["Breakfast: Tofu scramble with veggies and avocado (450 cal)", "Dinner: Vegan lentil curry with rice (480 cal)"],
        3: ["Breakfast: Tofu scramble with veggies and avocado (450 cal)", "Lunch: Vegan Buddha bowl with tahini (420 cal)", "Dinner: Vegan lentil curry with rice (480 cal)"],
        4: ["Breakfast: Tofu scramble with veggies and avocado (450 cal)", "Snack: Vegan protein bar (200 cal)", "Lunch: Vegan Buddha bowl with tahini (420 cal)", "Dinner: Vegan lentil curry with rice (480 cal)"],
        5: ["Breakfast: Tofu scramble with veggies and avocado (450 cal)", "Snack: Vegan protein bar (200 cal)", "Lunch: Vegan Buddha bowl with tahini (420 cal)", "Snack: Apple slices (60 cal)", "Dinner: Vegan lentil curry with rice (480 cal)"]
    },
    "500-600": {
        2: ["Breakfast: Vegan pancakes with maple syrup (550 cal)", "Dinner: Vegan lasagna with cashew cheese (580 cal)"],
        3: ["Breakfast: Vegan pancakes with maple syrup (550 cal)", "Lunch: Vegan chickpea salad sandwich (520 cal)", "Dinner: Vegan lasagna with cashew cheese (580 cal)"],
        4: ["Breakfast: Vegan pancakes with maple syrup (550 cal)", "Snack: Edamame (250 cal)", "Lunch: Vegan chickpea salad sandwich (520 cal)", "Dinner: Vegan lasagna with cashew cheese (580 cal)"],
        5: ["Breakfast: Vegan pancakes with maple syrup (550 cal)", "Snack: Edamame (250 cal)", "Lunch: Vegan chickpea salad sandwich (520 cal)", "Snack: Orange slices (60 cal)", "Dinner: Vegan lasagna with cashew cheese (580 cal)"]
    },
    "700-800": {
        2: ["Breakfast: Vegan breakfast burrito with tofu (750 cal)", "Dinner: Vegan shepherd's pie with lentils (780 cal)"],
        3: ["Breakfast: Vegan breakfast burrito with tofu (750 cal)", "Lunch: Vegan quinoa and black bean bowl (720 cal)", "Dinner: Vegan shepherd's pie with lentils (780 cal)"],
        4: ["Breakfast: Vegan breakfast burrito with tofu (750 cal)", "Snack: Vegan trail mix (200 cal)", "Lunch: Vegan quinoa and black bean bowl (720 cal)", "Dinner: Vegan shepherd's pie with lentils (780 cal)"],
        5: ["Breakfast: Vegan breakfast burrito with tofu (750 cal)", "Snack: Vegan trail mix (200 cal)", "Lunch: Vegan quinoa and black bean bowl (720 cal)", "Snack: Dark chocolate (50 cal)", "Dinner: Vegan shepherd's pie with lentils (780 cal)"]
    },
    // Missing ranges
    "100-200": {
        2: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)"],
        3: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)", "Snack: Celery (30 cal)"],
        4: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)", "Snack: Celery (30 cal)", "Snack: Cucumber slices (20 cal)"],
        5: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)", "Snack: Celery (30 cal)", "Snack: Cucumber slices (20 cal)", "Snack: Bell pepper strips (10 cal)"]
    },
    "200-300": {
        2: ["Breakfast: Vegan smoothie with berries (200 cal)", "Snack: Almonds (100 cal)"],
        3: ["Breakfast: Vegan smoothie with berries (200 cal)", "Snack: Almonds (100 cal)", "Snack: Apple slices (50 cal)"],
        4: ["Breakfast: Vegan smoothie with berries (200 cal)", "Snack: Almonds (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)"],
        5: ["Breakfast: Vegan smoothie with berries (200 cal)", "Snack: Almonds (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)", "Snack: Celery (20 cal)"]
    },
    "300-400": {
        2: ["Breakfast: Vegan oatmeal with fruit (300 cal)", "Snack: Vegan protein bar (100 cal)"],
        3: ["Breakfast: Vegan oatmeal with fruit (300 cal)", "Snack: Vegan protein bar (100 cal)", "Snack: Apple slices (50 cal)"],
        4: ["Breakfast: Vegan oatmeal with fruit (300 cal)", "Snack: Vegan protein bar (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)"],
        5: ["Breakfast: Vegan oatmeal with fruit (300 cal)", "Snack: Vegan protein bar (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)", "Snack: Celery (20 cal)"]
    },
    // Continue up to 1900-2000
},
Vegetarian: {
    // Existing ranges
    "400-500": {
        2: ["Breakfast: Veggie omelette with cheese (450 cal)", "Dinner: Eggplant parmesan with side salad (480 cal)"],
        3: ["Breakfast: Veggie omelette with cheese (450 cal)", "Lunch: Caprese sandwich with pesto (420 cal)", "Dinner: Eggplant parmesan with side salad (480 cal)"],
        4: ["Breakfast: Veggie omelette with cheese (450 cal)", "Snack: Yogurt with granola (200 cal)", "Lunch: Caprese sandwich with pesto (420 cal)", "Dinner: Eggplant parmesan with side salad (480 cal)"],
        5: ["Breakfast: Veggie omelette with cheese (450 cal)", "Snack: Yogurt with granola (200 cal)", "Lunch: Caprese sandwich with pesto (420 cal)", "Snack: Pear slices (60 cal)", "Dinner: Eggplant parmesan with side salad (480 cal)"]
    },
    "500-600": {
        2: ["Breakfast: Pancakes with maple syrup and berries (550 cal)", "Dinner: Spinach and ricotta stuffed shells (580 cal)"],
        3: ["Breakfast: Pancakes with maple syrup and berries (550 cal)", "Lunch: Veggie burger with sweet potato fries (520 cal)", "Dinner: Spinach and ricotta stuffed shells (580 cal)"],
        4: ["Breakfast: Pancakes with maple syrup and berries (550 cal)", "Snack: Cheese and crackers (250 cal)", "Lunch: Veggie burger with sweet potato fries (520 cal)", "Dinner: Spinach and ricotta stuffed shells (580 cal)"],
        5: ["Breakfast: Pancakes with maple syrup and berries (550 cal)", "Snack: Cheese and crackers (250 cal)", "Lunch: Veggie burger with sweet potato fries (520 cal)", "Snack: Dark chocolate (50 cal)", "Dinner: Spinach and ricotta stuffed shells (580 cal)"]
    },
    "700-800": {
        2: ["Breakfast: Veggie breakfast burrito with eggs (750 cal)", "Dinner: Vegetarian lasagna with side salad (780 cal)"],
        3: ["Breakfast: Veggie breakfast burrito with eggs (750 cal)", "Lunch: Grilled cheese sandwich with tomato soup (720 cal)", "Dinner: Vegetarian lasagna with side salad (780 cal)"],
        4: ["Breakfast: Veggie breakfast burrito with eggs (750 cal)", "Snack: Cheese and fruit plate (200 cal)", "Lunch: Grilled cheese sandwich with tomato soup (720 cal)", "Dinner: Vegetarian lasagna with side salad (780 cal)"],
        5: ["Breakfast: Veggie breakfast burrito with eggs (750 cal)", "Snack: Cheese and fruit plate (200 cal)", "Lunch: Grilled cheese sandwich with tomato soup (720 cal)", "Snack: Apple slices (60 cal)", "Dinner: Vegetarian lasagna with side salad (780 cal)"]
    },
    // Missing ranges
    "100-200": {
        2: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)"],
        3: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)", "Snack: Celery (30 cal)"],
        4: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)", "Snack: Celery (30 cal)", "Snack: Cucumber slices (20 cal)"],
        5: ["Snack: Apple slices (100 cal)", "Snack: Carrot sticks (50 cal)", "Snack: Celery (30 cal)", "Snack: Cucumber slices (20 cal)", "Snack: Bell pepper strips (10 cal)"]
    },
    "200-300": {
        2: ["Breakfast: Yogurt with granola (200 cal)", "Snack: Almonds (100 cal)"],
        3: ["Breakfast: Yogurt with granola (200 cal)", "Snack: Almonds (100 cal)", "Snack: Apple slices (50 cal)"],
        4: ["Breakfast: Yogurt with granola (200 cal)", "Snack: Almonds (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)"],
        5: ["Breakfast: Yogurt with granola (200 cal)", "Snack: Almonds (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)", "Snack: Celery (20 cal)"]
    },
    "300-400": {
        2: ["Breakfast: Oatmeal with fruit (300 cal)", "Snack: Cheese and crackers (100 cal)"],
        3: ["Breakfast: Oatmeal with fruit (300 cal)", "Snack: Cheese and crackers (100 cal)", "Snack: Apple slices (50 cal)"],
        4: ["Breakfast: Oatmeal with fruit (300 cal)", "Snack: Cheese and crackers (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)"],
        5: ["Breakfast: Oatmeal with fruit (300 cal)", "Snack: Cheese and crackers (100 cal)", "Snack: Apple slices (50 cal)", "Snack: Carrot sticks (30 cal)", "Snack: Celery (20 cal)"]
    },

    

    // Continue up to 1900-2000
}

   
};


const dietitianMealPlans = {
    Anything: [
        {
            dietitian: "Dr. Emily Collins",
            meals: [
                "Breakfast: Oatmeal with almond butter and banana",
                "Lunch: Grilled chicken with quinoa and roasted vegetables",
                "Snack: Greek yogurt with walnuts and honey",
                "Dinner: Grilled salmon with brown rice and steamed broccoli"
            ]
        },
        {
            dietitian: "Dr. Sarah Thompson",
            meals: [
                "Breakfast: Smoothie with spinach, banana, and protein powder",
                "Lunch: Turkey wrap with whole grain tortilla and veggies",
                "Snack: Apple slices with peanut butter",
                "Dinner: Baked cod with mashed sweet potatoes and green beans"
            ]
        },
        {
            dietitian: "Dr. Laura Bennett",
            meals: [
                "Breakfast: Avocado toast with a poached egg",
                "Lunch: Quinoa salad with chickpeas and feta",
                "Snack: Cottage cheese with pineapple",
                "Dinner: Grilled shrimp with couscous and asparagus"
            ]
        }
    ],
    "high-protein": [
        {
            dietitian: "Dr. James Parker",
            meals: [
                "Breakfast: Scrambled eggs with whole wheat toast and avocado",
                "Lunch: Grilled chicken breast with sweet potatoes and steamed green beans",
                "Snack: Protein shake with banana and peanut butter",
                "Dinner: Baked salmon with quinoa and asparagus"
            ]
        },
        {
            dietitian: "Dr. Michael Johnson",
            meals: [
                "Breakfast: Greek yogurt with granola and berries",
                "Lunch: Beef stir-fry with brown rice and broccoli",
                "Snack: Hard-boiled eggs and carrot sticks",
                "Dinner: Grilled turkey burger with a side salad"
            ]
        },
        {
            dietitian: "Dr. Rachel Green",
            meals: [
                "Breakfast: Protein pancakes with almond butter",
                "Lunch: Tuna salad with mixed greens and olive oil dressing",
                "Snack: Edamame and a handful of almonds",
                "Dinner: Grilled steak with roasted Brussels sprouts"
            ]
        }
    ],
    keto: [
        {
            dietitian: "Dr. Olivia Martinez",
            meals: [
                "Breakfast: Cheese and spinach omelet with avocado",
                "Lunch: Grilled steak with sautéed mushrooms and buttered broccoli",
                "Snack: Almonds and a slice of cheddar cheese",
                "Dinner: Pan-seared salmon with zucchini noodles and creamy garlic sauce"
            ]
        },
        {
            dietitian: "Dr. Kevin White",
            meals: [
                "Breakfast: Bacon and eggs with a side of avocado",
                "Lunch: Chicken Caesar salad (no croutons)",
                "Snack: Celery sticks with cream cheese",
                "Dinner: Beef stir-fry with cauliflower rice"
            ]
        },
        {
            dietitian: "Dr. Amanda Clark",
            meals: [
                "Breakfast: Keto smoothie with coconut milk and chia seeds",
                "Lunch: Grilled salmon with a side of spinach sautéed in olive oil",
                "Snack: Macadamia nuts and a boiled egg",
                "Dinner: Lamb chops with roasted cauliflower"
            ]
        }
    ],
    mediterranean: [
        {
            dietitian: "Dr. Sophia Romano",
            meals: [
                "Breakfast: Greek yogurt with walnuts, honey, and mixed berries",
                "Lunch: Grilled fish with quinoa and roasted bell peppers",
                "Snack: Hummus with cucumber and whole-grain crackers",
                "Dinner: Lentil soup with a side of mixed greens and feta cheese"
            ]
        },
        {
            dietitian: "Dr. Mark Taylor",
            meals: [
                "Breakfast: Whole grain toast with olive oil and tomatoes",
                "Lunch: Grilled chicken with tabbouleh and tzatziki",
                "Snack: Olives and a handful of almonds",
                "Dinner: Baked cod with a Mediterranean vegetable medley"
            ]
        },
        {
            dietitian: "Dr. Hannah Lee",
            meals: [
                "Breakfast: Omelet with spinach, feta, and olives",
                "Lunch: Falafel wrap with tahini sauce",
                "Snack: Fresh figs and a handful of walnuts",
                "Dinner: Grilled shrimp with orzo and a Greek salad"
            ]
        }
    ],
    paleo: [
        {
            dietitian: "Dr. Daniel Carter",
            meals: [
                "Breakfast: Scrambled eggs with sautéed spinach and bacon",
                "Lunch: Grilled chicken salad with olive oil dressing",
                "Snack: Mixed nuts and an apple",
                "Dinner: Bison steak with roasted sweet potatoes and steamed kale"
            ]
        },
        {
            dietitian: "Dr. Lisa Brown",
            meals: [
                "Breakfast: Sweet potato hash with ground turkey and eggs",
                "Lunch: Grilled salmon with a side of roasted vegetables",
                "Snack: Kale chips and a handful of almonds",
                "Dinner: Grilled chicken with mashed cauliflower"
            ]
        },
        {
            dietitian: "Dr. Rahul Mehta",
            meals: [
                "Breakfast: Coconut flour pancakes with berries",
                "Lunch: Beef and vegetable stir-fry",
                "Snack: Boiled eggs and avocado slices",
                "Dinner: Roasted duck with a side of Brussels sprouts"
            ]
        }
    ],
    vegan: [
        {
            dietitian: "Dr. Hannah Lee",
            meals: [
                "Breakfast: Chia pudding with almond milk and berries",
                "Lunch: Quinoa and black bean salad with avocado",
                "Snack: Roasted chickpeas and a green smoothie",
                "Dinner: Stir-fried tofu with brown rice and broccoli"
            ]
        },
        {
            dietitian: "Dr. Sarah Wilson",
            meals: [
                "Breakfast: Smoothie bowl with granola and fruit",
                "Lunch: Lentil and vegetable curry with rice",
                "Snack: Fresh fruit and a handful of nuts",
                "Dinner: Vegan chili with cornbread"
            ]
        },
        {
            dietitian: "Dr. Laura Davis",
            meals: [
                "Breakfast: Avocado toast with a sprinkle of nutritional yeast",
                "Lunch: Buddha bowl with quinoa, roasted veggies, and tahini dressing",
                "Snack: Dark chocolate and a handful of almonds",
                "Dinner: Stuffed bell peppers with black beans and rice"
            ]
        }
    ],
    vegetarian: [
        {
            dietitian: "Dr. Rahul Mehta",
            meals: [
                "Breakfast: Whole wheat toast with peanut butter and banana",
                "Lunch: Paneer curry with brown rice and spinach",
                "Snack: Yogurt with flaxseeds and honey",
                "Dinner: Lentil soup with whole grain pita bread"
            ]
        },
        {
            dietitian: "Dr. Sophia Romano",
            meals: [
                "Breakfast: Smoothie with spinach, banana, and almond milk",
                "Lunch: Caprese salad with whole grain bread",
                "Snack: Trail mix with dried fruit and nuts",
                "Dinner: Eggplant parmesan with a side salad"
            ]
        },
        {
            dietitian: "Dr. Emily Collins",
            meals: [
                "Breakfast: Oatmeal with fresh fruit and nuts",
                "Lunch: Veggie wrap with hummus and avocado",
                "Snack: Cheese and crackers",
                "Dinner: Spinach and ricotta stuffed shells"
            ]
        }
    ],
    // Default Plan (fallback if no specific plan is found)
    default: [
        {
            dietitian: "Dr. General Nutritionist",
            meals: [
                "Breakfast: Whole grain toast with avocado and a boiled egg",
                "Lunch: Grilled chicken salad with mixed greens and olive oil dressing",
                "Snack: A handful of mixed nuts and a piece of fruit",
                "Dinner: Grilled fish with quinoa and steamed vegetables"
            ]
        }
    ]
};


let currentMode = "ai"; // Default mode is AI-Generated

function toggleMode(mode) {
    currentMode = mode;
    document.querySelectorAll(".toggle-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`${mode}-toggle`).classList.add("active");
}

function selectDiet(element) {
    document.querySelectorAll(".diet-option").forEach(opt => opt.classList.remove("selected"));
    element.classList.add("selected");
}

function generatePlan() {
    const diet = document.querySelector(".selected").textContent.trim();
    const calories = document.getElementById("calories").value;
    const meals = document.getElementById("meals").value;
    const mealPlanDiv = document.getElementById("meal-plan-content");
    const loadingSpinner = document.getElementById("loading-spinner");

    
    // Default meal plan
    const defaultAIMealPlan = {
        2: ["Breakfast: Avocado toast with poached egg (650 cal)", "Dinner: Mushroom risotto with parmesan (670 cal)"],
        3: ["Breakfast: Avocado toast with poached egg (650 cal)", "Lunch: Chickpea and spinach curry with rice (690 cal)", "Dinner: Mushroom risotto with parmesan (670 cal)"],
        4: ["Breakfast: Avocado toast with poached egg (650 cal)", "Snack: Almonds and dried fruit (200 cal)", "Lunch: Chickpea and spinach curry with rice (690 cal)", "Dinner: Mushroom risotto with parmesan (670 cal)"],
        5: ["Breakfast: Avocado toast with poached egg (650 cal)", "Snack: Almonds and dried fruit (200 cal)", "Lunch: Chickpea and spinach curry with rice (690 cal)", "Snack: Dark chocolate (50 cal)", "Dinner: Mushroom risotto with parmesan (670 cal)"]
    };

        // Default dietitian meal plan (fallback)
        const defaultDietitianPlan = [
        {
            dietitian: "Dr. General Nutritionist",
            meals: [
                "Breakfast: Whole grain toast with avocado and a boiled egg",
                "Lunch: Grilled chicken salad with mixed greens and olive oil dressing",
                "Snack: A handful of mixed nuts and a piece of fruit",
                "Dinner: Grilled fish with quinoa and steamed vegetables"
            ]
        }
    ];

    // Show loading spinner
    loadingSpinner.style.display = "flex";
    mealPlanDiv.innerHTML = "";

    setTimeout(() => {
        let mealText = "";
        if (currentMode === "ai") {
            const calorieRange = getCalorieRange(calories);
            if (mealPlans[diet] && mealPlans[diet][calorieRange]) {
                const selectedPlan = mealPlans[diet][calorieRange][meals];
                mealText = `<h3>Your AI-Generated Meal Plan:</h3>`;
                selectedPlan.forEach((meal, index) => {
                    mealText += `<div class="meal-card"><h3>Meal ${index + 1}:</h3><p>${meal}</p></div>`;
                });
            } else {
                    // Use AI default meal plan
                if (defaultAIMealPlan[meals]) {
                    mealText = `<h3>Default Meal Plan:</h3><ul>`;
                    defaultAIMealPlan[meals].forEach(meal => {
                        mealText += `<li>${meal}</li>`;
                    });
                    mealText += "</ul>";
                } else {
                    mealText = `<p>No plan available for this meal count.</p>`;
                }
            }
        } else {
            const plan = dietitianMealPlans[diet.toLowerCase()];
            if (plan) {
                const randomPlan = plan[Math.floor(Math.random() * plan.length)];
                mealText = `<h3>Dietitian: ${randomPlan.dietitian}</h3><ul>`;
                randomPlan.meals.slice(0, meals).forEach(meal => {
                    mealText += `<li>${meal}</li>`;
                });
                mealText += "</ul>";
            } else {
                // Use default dietitian meal plan
                const fallbackPlan = defaultDietitianPlan[0]; // Default to first fallback plan
                if (fallbackPlan.meals.length >= meals) {
                    mealText = `<h3>Dietitian: ${fallbackPlan.dietitian}</h3><ul>`;
                    fallbackPlan.meals.slice(0, meals).forEach(meal => {
                        mealText += `<li>${meal}</li>`;
                    });
                    mealText += "</ul>";
                } else {
                    mealText = `<p>No dietitian meal plan available for this meal count.</p>`;
                }
            }
        }
        // Hide loading spinner and display meal plan
        loadingSpinner.style.display = "none";
        mealPlanDiv.innerHTML = mealText;
    }, 1000); 
}

function getCalorieRange(calories) {
    const ranges = Object.keys(mealPlans["Anything"]);
    for (const range of ranges) {
        const [min, max] = range.split("-").map(Number);
        if (calories >= min && calories <= max) {
            return range;
        }
    }
    return null;
}