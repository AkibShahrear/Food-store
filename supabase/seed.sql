-- Seed data for food store database
-- Insert sample products

INSERT INTO products (name, description, price, image_url, category, stock, calories, spicy_level) VALUES
('Margherita Pizza', 'Classic pizza with fresh mozzarella, tomatoes, and basil', 12.99, '/images/margherita.jpg', 'Pizza', 50, 250, 'Mild'),
('Spicy Wings', 'Crispy chicken wings with hot sauce', 8.99, '/images/wings.jpg', 'Appetizers', 100, 180, 'Hot'),
('Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 9.99, '/images/caesar.jpg', 'Salads', 40, 150, 'Mild'),
('Pepperoni Pizza', 'Pizza topped with pepperoni and cheese', 14.99, '/images/pepperoni.jpg', 'Pizza', 60, 280, 'Mild'),
('Garlic Bread', 'Toasted bread with garlic butter and herbs', 5.99, '/images/garlic_bread.jpg', 'Appetizers', 80, 200, 'Mild'),
('Grilled Fish', 'Fresh grilled salmon with lemon butter', 18.99, '/images/fish.jpg', 'Mains', 35, 320, 'Mild'),
('Biryani', 'Fragrant Indian rice with spices and chicken', 11.99, '/images/biryani.jpg', 'Mains', 45, 400, 'Medium'),
('Pad Thai', 'Stir-fried noodles with vegetables and peanuts', 10.99, '/images/pad_thai.jpg', 'Noodles', 55, 350, 'Medium'),
('Chocolate Cake', 'Rich chocolate layer cake with frosting', 6.99, '/images/chocolate_cake.jpg', 'Desserts', 30, 450, 'Mild'),
('Green Smoothie', 'Fresh blend of spinach, apple, and ginger', 7.99, '/images/smoothie.jpg', 'Beverages', 100, 120, 'Mild');

