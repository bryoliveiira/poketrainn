<?php
header('Content-Type: application/json');

$generationId = $_GET['generationId'] ?? 1;
$isShiny = isset($_GET['shiny']) && $_GET['shiny'] === 'true';
$drawnIds = isset($_GET['drawnIds']) ? json_decode($_GET['drawnIds']) : [];

$pokemonListUrl = "";

if ($generationId === "all") {
    $pokemonListUrl = "https://pokeapi.co/api/v2/pokemon-species/?limit=1025";
} else {
    $pokemonListUrl = "https://pokeapi.co/api/v2/generation/" . $generationId;
}

$listResponse = @file_get_contents($pokemonListUrl);

if ($listResponse === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Falha ao buscar a lista de Pokémon.']);
    exit;
}

$listData = json_decode($listResponse, true);

if ($generationId === "all") {
    $pokemonSpeciesList = $listData['results'];
} else {
    $pokemonSpeciesList = $listData['pokemon_species'];
}

if (empty($pokemonSpeciesList)) {
    http_response_code(404);
    echo json_encode(['error' => 'Nenhum Pokémon encontrado nesta seleção.']);
    exit;
}

$availablePokemonSpecies = [];
foreach ($pokemonSpeciesList as $species) {
    $urlParts = explode('/', rtrim($species['url'], '/'));
    $pokemonId = end($urlParts);
    if (!in_array($pokemonId, $drawnIds)) {
        $availablePokemonSpecies[] = $species;
    }
}

if (empty($availablePokemonSpecies)) {
    http_response_code(404);
    echo json_encode(['error' => 'Todos os Pokémon desta seleção já foram sorteados.']);
    exit;
}

$randomIndex = array_rand($availablePokemonSpecies);
$selectedPokemonUrl = $availablePokemonSpecies[$randomIndex]['url'];
$urlParts = explode('/', rtrim($selectedPokemonUrl, '/'));
$pokemonIdOrName = end($urlParts);
$pokemonApiUrl = "https://pokeapi.co/api/v2/pokemon/" . $pokemonIdOrName;
$pokemonResponse = @file_get_contents($pokemonApiUrl);

if ($pokemonResponse === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Falha ao buscar dados do Pokémon.']);
    exit;
}

$pokemonData = json_decode($pokemonResponse, true);
$pokemonData['is_shiny'] = false;
if ($isShiny) {
    $pokemonData['sprites']['front_default'] = $pokemonData['sprites']['front_shiny'];
    $pokemonData['is_shiny'] = true;
}

echo json_encode($pokemonData);
?>