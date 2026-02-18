<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM categories");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name required']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO categories (name) VALUES (?)");
        $stmt->execute([$data['name']]);
        echo json_encode(['id' => $pdo->lastInsertId(), 'name' => $data['name']]);
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name required']);
            exit;
        }

        // Get old name
        $stmt = $pdo->prepare("SELECT name FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        $oldCat = $stmt->fetch();

        if ($oldCat) {
            $oldName = $oldCat['name'];
            $newName = $data['name'];

            // Update category
            $stmt = $pdo->prepare("UPDATE categories SET name = ? WHERE id = ?");
            $stmt->execute([$newName, $id]);

            // Update files
            $stmt = $pdo->prepare("UPDATE files SET category = ? WHERE category = ?");
            $stmt->execute([$newName, $oldName]);
            
            echo json_encode(['message' => 'Updated']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Category not found']);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Deleted']);
        break;
}
?>