let pokemonCount = 0;
const teamLimit = 6;
let teamData = [];
const drawnPokemonIds = []; 
const spinButton = document.getElementById('spin-button');
const rouletteWheel = document.getElementById('roulette-image');
const pokemonSprite = document.getElementById('pokemon-sprite');
const teamList = document.getElementById('pokemon-list');
const counter = document.getElementById('counter');
const genderImages = document.querySelectorAll('.gender-img');
const generationBox = document.getElementById('generation-box');
const generationButtons = document.querySelectorAll('.generation-btn');
const gameBox = document.querySelector('.game-box');
const teamBox = document.querySelector('.team-box');
const finalTeamModal = document.getElementById('final-team-modal');
const finalPokemonList = document.getElementById('final-pokemon-list');
const resetButton = document.getElementById('reset-button');

let selectedGenerationId = null;

const typeColors = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6',
    fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', steel: '#B7B7CE', dark: '#705746', fairy: '#D685AD'
};


genderImages.forEach(image => {
    image.addEventListener('click', () => {
        genderImages.forEach(img => img.classList.remove('active'));
        image.classList.add('active');
        generationBox.classList.remove('hidden');
    });
});

generationButtons.forEach(button => {
    button.addEventListener('click', () => {
        generationButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        selectedGenerationId = button.getAttribute('data-generation');
        spinButton.classList.remove('hidden');

        gameBox.classList.remove('hidden');
        teamBox.classList.remove('hidden');
    });
});

spinButton.addEventListener('click', () => {
    if (pokemonCount >= teamLimit) {
        alert("Seu time já está completo!");
        return;
    }
    if (!selectedGenerationId) {
        alert("Por favor, selecione uma geração primeiro.");
        return;
    }

    spinButton.disabled = true;
    rouletteWheel.classList.add('spin-animation');
    pokemonSprite.style.display = 'none';

    const isShiny = Math.random() < 0.01;
    const shinyParam = isShiny ? '&shiny=true' : '';
    const drawnIdsParam = `&drawnIds=${JSON.stringify(drawnPokemonIds)}`;

    fetch(`get_pokemon.php?generationId=${selectedGenerationId}${shinyParam}${drawnIdsParam}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro no Servidor. Status: ' + response.status);
            }
            return response.json(); 
        })
        .then(data => {
            if (data.error) {
                 throw new Error(data.error);
            }
            setTimeout(() => {
                rouletteWheel.classList.remove('spin-animation');
                displayPokemon(data);
                addPokemonToTeam(data);
                spinButton.disabled = false;
            }, 3000);
        })
        .catch(error => {
            console.error('Erro ao sortear Pokémon:', error);
            alert(error.message || 'Falha ao sortear o Pokémon. Verifique se o Apache está ligado.');
            rouletteWheel.classList.remove('spin-animation');
            spinButton.disabled = false;
        });
});

function displayPokemon(pokemonData) {
    if (pokemonData.detail && pokemonData.detail === 'Not Found.') {
        alert('Pokémon não encontrado.');
        return;
    }
    pokemonSprite.src = pokemonData.sprites.front_default;
    pokemonSprite.alt = pokemonData.name;
    pokemonSprite.style.display = 'block';
    
    pokemonSprite.classList.remove('shiny-pokemon');
    if (pokemonData.is_shiny) {
        pokemonSprite.classList.add('shiny-pokemon');
    }
}

function createTypeBadge(type) {
    const badge = document.createElement('span');
    badge.textContent = type.name;
    badge.classList.add('type-badge');
    badge.style.backgroundColor = typeColors[type.name];
    return badge;
}

function addPokemonToTeam(pokemonData) {
    pokemonCount++;
    counter.textContent = `Pokémon no time: ${pokemonCount} de ${teamLimit}`;

    const listItem = document.createElement('li');

    const pokemonImage = document.createElement('img');
    pokemonImage.src = pokemonData.sprites.front_default;
    pokemonImage.alt = pokemonData.name;
    
    if (pokemonData.is_shiny) {
        pokemonImage.classList.add('shiny-pokemon');
    }

    const pokemonName = document.createElement('span');
    pokemonName.textContent = pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
    
    if (pokemonData.is_shiny) {
        const shinyText = document.createElement('span');
        shinyText.textContent = ' ✨ Shiny!';
        shinyText.style.fontWeight = 'bold';
        shinyText.style.color = '#ffcc00';
        pokemonName.appendChild(shinyText);
    }
    
    const typeContainer = document.createElement('div');
    typeContainer.classList.add('type-container');
    pokemonData.types.forEach(t => {
        typeContainer.appendChild(createTypeBadge(t.type));
    });

    listItem.appendChild(pokemonImage);
    listItem.appendChild(pokemonName);
    listItem.appendChild(typeContainer);
    
    teamList.appendChild(listItem);
    
    teamData.push(pokemonData);
    drawnPokemonIds.push(pokemonData.id);

    if (pokemonCount >= teamLimit) {
        spinButton.disabled = true;
        spinButton.textContent = 'Time Completo!';
        showFinalTeamPopup();
    }
}

function showFinalTeamPopup() {
    finalPokemonList.innerHTML = '';
    teamData.forEach(pokemon => {
        const listItem = document.createElement('li');

        const pokemonImage = document.createElement('img');
        pokemonImage.src = pokemon.sprites.front_default;
        pokemonImage.alt = pokemon.name;
        
        if (pokemon.is_shiny) {
            pokemonImage.classList.add('shiny-pokemon');
        }

        const pokemonName = document.createElement('span');
        pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        
        if (pokemon.is_shiny) {
            const shinyText = document.createElement('span');
            shinyText.textContent = ' ✨ Shiny!';
            shinyText.style.fontWeight = 'bold';
            shinyText.style.color = '#ffcc00';
            pokemonName.appendChild(shinyText);
        }

        const typeContainer = document.createElement('div');
        typeContainer.classList.add('type-container');
        pokemon.types.forEach(t => {
            typeContainer.appendChild(createTypeBadge(t.type));
        });

        listItem.appendChild(pokemonImage);
        listItem.appendChild(pokemonName);
        listItem.appendChild(typeContainer);
        finalPokemonList.appendChild(listItem);
    });

    finalTeamModal.classList.remove('hidden');
}

resetButton.addEventListener('click', () => {
    finalTeamModal.classList.add('hidden');
    pokemonCount = 0;
    teamData = [];
    drawnPokemonIds.length = 0; 
    teamList.innerHTML = '';
    counter.textContent = `Pokémon no time: 0 de 6`;
    spinButton.disabled = false;
    spinButton.textContent = 'Girar!';

    gameBox.classList.add('hidden');
    teamBox.classList.add('hidden');
    
    generationButtons.forEach(btn => btn.classList.remove('active'));
    genderImages.forEach(img => img.classList.remove('active'));
    generationBox.classList.add('hidden');
    spinButton.classList.add('hidden');
});