<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM folders WHERE id = ?");
                $stmt->execute([$id]);
                $folder = $stmt->fetch();
                if ($folder) {
                    // Map status
                    if ($folder['status'] === 'aperta') $folder['status'] = 'Da Iniziare';
                    elseif ($folder['status'] === 'chiusa') $folder['status'] = 'Finita';
                    elseif ($folder['status'] === 'archiviata') $folder['status'] = 'Sospese';
                    echo json_encode($folder);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Folder not found']);
                }
            } else {
                $search = isset($_GET['search']) ? $_GET['search'] : '';
                $sql = "SELECT * FROM folders";
                $params = [];
                
                if ($search) {
                    $sql .= " WHERE clientName LIKE ? OR constructionSite LIKE ? OR projectCode LIKE ?";
                    $term = "%$search%";
                    $params = [$term, $term, $term];
                }
                
                $sql .= " ORDER BY createdAt DESC";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $folders = $stmt->fetchAll();
                
                // Map statuses
                foreach ($folders as &$row) {
                    if ($row['status'] === 'aperta') $row['status'] = 'Da Iniziare';
                    elseif ($row['status'] === 'chiusa') $row['status'] = 'Finita';
                    elseif ($row['status'] === 'archiviata') $row['status'] = 'Sospese';
                }
                
                echo json_encode($folders);
            }
            break;

        case 'POST':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON input');
            }
            
            // Generate Project Code
            if (empty($data['projectCode'])) {
                $stmt = $pdo->query("SELECT projectCode FROM folders ORDER BY id DESC LIMIT 1");
                $row = $stmt->fetch();
                $nextNum = 1;
                if ($row && $row['projectCode']) {
                    $numPart = intval(str_replace('#', '', $row['projectCode']));
                    if ($numPart > 0) $nextNum = $numPart + 1;
                }
                $data['projectCode'] = '#' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
            }
            
            $sql = "INSERT INTO folders (clientName, constructionSite, description, projectRef, phone, thirdParty, projectDate, notes, projectCode, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['clientName'] ?? '', 
                $data['constructionSite'] ?? '', 
                $data['description'] ?? '', 
                $data['projectRef'] ?? '', 
                $data['phone'] ?? '', 
                $data['thirdParty'] ?? '', 
                $data['projectDate'] ?? '', 
                $data['notes'] ?? '', 
                $data['projectCode'], 
                $data['status'] ?? 'Da Iniziare'
            ]);
            
            echo json_encode(['id' => $pdo->lastInsertId(), 'projectCode' => $data['projectCode']]);
            break;

        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID required']);
                exit;
            }
            
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON input');
            }

            $sql = "UPDATE folders SET clientName=?, constructionSite=?, description=?, projectRef=?, phone=?, thirdParty=?, projectDate=?, notes=?, status=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['clientName'] ?? '', 
                $data['constructionSite'] ?? '', 
                $data['description'] ?? '', 
                $data['projectRef'] ?? '', 
                $data['phone'] ?? '', 
                $data['thirdParty'] ?? '', 
                $data['projectDate'] ?? '', 
                $data['notes'] ?? '', 
                $data['status'] ?? 'Da Iniziare', 
                $id
            ]);
            
            echo json_encode(['message' => 'Updated']);
            break;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID required']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM folders WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Deleted']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>