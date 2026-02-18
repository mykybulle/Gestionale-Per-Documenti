<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$folderId = isset($_GET['folderId']) ? intval($_GET['folderId']) : null;

switch ($method) {
    case 'GET':
        if ($folderId) {
            $stmt = $pdo->prepare("SELECT * FROM files WHERE folderId = ?");
            $stmt->execute([$folderId]);
            echo json_encode($stmt->fetchAll());
        } else {
            echo json_encode([]);
        }
        break;

    case 'POST':
        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            exit;
        }

        $folderId = $_POST['folderId'];
        $category = $_POST['category'];
        $file = $_FILES['file'];
        
        $uploadDir = '../uploads/';
        if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $filename = time() . '-' . basename($file['name']);
        $targetPath = $uploadDir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $sql = "INSERT INTO files (folderId, name, type, size, path, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $folderId, $file['name'], $file['type'], 
                $file['size'], $filename, $category
            ]);
            
            echo json_encode([
                'id' => $pdo->lastInsertId(),
                'folderId' => $folderId,
                'name' => $file['name'],
                'path' => $filename,
                'category' => $category
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Upload failed']);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $updates = [];
        $params = [];

        if (isset($data['category'])) {
            $updates[] = "category = ?";
            $params[] = $data['category'];
        }
        if (isset($data['name'])) {
            $updates[] = "name = ?";
            $params[] = $data['name'];
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No updates']);
            exit;
        }

        $sql = "UPDATE files SET " . implode(", ", $updates) . " WHERE id = ?";
        $params[] = $id;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['message' => 'Updated']);
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            exit;
        }

        // Get file path first
        $stmt = $pdo->prepare("SELECT path FROM files WHERE id = ?");
        $stmt->execute([$id]);
        $file = $stmt->fetch();

        if ($file) {
            $filePath = '../uploads/' . $file['path'];
            if (file_exists($filePath)) unlink($filePath);
            
            $stmt = $pdo->prepare("DELETE FROM files WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Deleted']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'File not found']);
        }
        break;
}
?>