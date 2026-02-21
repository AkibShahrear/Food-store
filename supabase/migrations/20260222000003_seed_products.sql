-- Seed initial product data
DELETE FROM products WHERE TRUE;

INSERT INTO products (name, description, price, image_url, category, stock, calories, spicy_level) 
VALUES
('Margherita Pizza', 'Classic pizza with fresh mozzarella, tomatoes, and basil', 12.99, '/images/margherita.jpg', 'Pizza', 50, 250, 'Mild'),
('Spicy Wings', 'Crispy chicken wings with hot sauce', 8.99, '/images/wings.jpg', 'Appetizers', 100, 180, 'Hot'),
('Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 9.99, '/images/caesar.jpg', 'Salads', 40, 150, 'Mild'),
('Pepperoni Pizza', 'Pizza topped with pepperoni and cheese', 14.99, '/images/pepperoni.jpg', 'Pizza', 60, 280, 'Mild'),
('Garlic Bread', 'Toasted bread with garlic butter and herbs', 5.99, '/images/garlic_bread.jpg', 'Appetizers', 80, 200, 'Mild'),
('Grilled Fish', 'Fresh grilled salmon with lemon butter', 18.99, '/images/fish.jpg', 'Mains', 35, 320, 'Mild'),
('Biryani', 'Fragrant Indian rice with spices and chicken', 11.99, '/images/biryani.jpg', 'Mains', 45, 400, 'Medium'),
('Pad Thai', 'Stir-fried noodles with vegetables and peanuts', 10.99, '/images/pad_thai.jpg', 'Noodles', 55, 350, 'Medium'),
('Chocolate Cake', 'Rich chocolate layer cake with frosting', 6.99, '/images/chocolate_cake.jpg', 'Desserts', 30, 450, 'Mild'),
('Green Smoothie', 'Fresh blend of spinach, apple, and ginger', 7.99, '/images/smoothie.jpg', 'Beverages', 100, 120, 'Mild'),
('Cheeseburger', 'Juicy beef burger with melted cheese and lettuce', 10.99, '/images/burger.jpg', 'Mains', 70, 550, 'Mild'),
('Veggie Pizza', 'Garden fresh vegetables with mozzarella', 11.99, '/images/veggie_pizza.jpg', 'Pizza', 55, 230, 'Mild'),
('Chicken Tenders', 'Golden fried chicken tenders with dipping sauce', 8.99, '/images/tenders.jpg', 'Appetizers', 85, 280, 'Mild'),
('Fettuccine Alfredo', 'Creamy parmesan sauce with fettuccine pasta', 12.99, '/images/alfredo.jpg', 'Pasta', 50, 580, 'Mild'),
('Shrimp Scampi', 'Succulent shrimp in garlic and white wine sauce', 16.99, '/images/scampi.jpg', 'Mains', 40, 320, 'Medium'),
('Mozzarella Sticks', 'Crispy fried mozzarella with marinara dip', 6.99, '/images/mozz_sticks.jpg', 'Appetizers', 90, 220, 'Mild'),
('Grilled Chicken Salad', 'Caesar salad topped with grilled chicken breast', 12.99, '/images/chicken_salad.jpg', 'Salads', 45, 280, 'Mild'),
('Beef Tacos', 'Three soft tortillas with seasoned beef and toppings', 9.99, '/images/tacos.jpg', 'Mains', 65, 420, 'Medium'),
('Tiramisu', 'Italian dessert with mascarpone and espresso', 5.99, '/images/tiramisu.jpg', 'Desserts', 35, 380, 'Mild'),
('Iced Tea', 'Fresh brewed iced tea with lemon', 2.49, '/images/iced_tea.jpg', 'Beverages', 150, 0, 'Mild'),
('Soft Drink (Large)', 'Choice of cola, sprite, or lemonade', 2.99, '/images/soft_drink.jpg', 'Beverages', 200, 150, 'Mild'),
('Cheesecake', 'Classic New York style cheesecake with fruit', 6.99, '/images/cheesecake.jpg', 'Desserts', 25, 420, 'Mild'),
('Fish & Chips', 'Crispy battered fish with golden chips', 11.99, '/images/fish_chips.jpg', 'Mains', 50, 580, 'Mild'),
('Pad See Ew', 'Wide noodle stir-fry with soy sauce and chicken', 10.99, '/images/pad_see_ew.jpg', 'Noodles', 60, 380, 'Medium'),
('Spring Rolls', 'Fresh or fried rolls with vegetables and protein', 7.99, '/images/spring_rolls.jpg', 'Appetizers', 75, 150, 'Mild');
