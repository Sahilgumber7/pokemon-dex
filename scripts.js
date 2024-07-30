document.addEventListener('DOMContentLoaded', () => {
  const pokemonContainer = document.getElementById('pokemon-container');
  const searchBar = document.getElementById('search-bar');
  const regionSelect = document.getElementById('region-select');
  const typeSelect = document.getElementById('type-select');
  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const goToPageButton = document.getElementById('go-to-page');
  const pageNumberInput = document.getElementById('page-number');
  const pageInfo = document.getElementById('page-info');
  const noResultsMessage = document.createElement('div');
  noResultsMessage.id = 'no-results';
  noResultsMessage.textContent = 'No results found.';
  pokemonContainer.appendChild(noResultsMessage);
  noResultsMessage.style.display = 'none';

  let currentPage = 1;
  const limit = 50;
  let totalPokemons = 0;
  let pokemons = []; // Store all Pokémon data
  let filteredPokemons = []; // Store filtered Pokémon data
  let currentRegion = 'all';
  let currentType = 'all';

  // Region to Pokémon index mapping
  const regionRanges = {
    all: [1, 1008],
    kanto: [1, 151],
    johto: [152, 251],
    hoenn: [252, 386],
    sinnoh: [387, 493],
    unova: [494, 649],
    kalos: [650, 721],
    alola: [722, 809],
    galar: [810, 898],
    paldea: [899, 1008] // Adjust based on the latest data
  };

  // Fetch all Pokémon types from PokéAPI
  const fetchTypes = async () => {
    const response = await fetch('https://pokeapi.co/api/v2/type');
    const data = await response.json();
    data.results.forEach(type => {
      const option = document.createElement('option');
      option.value = type.name;
      option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
      typeSelect.appendChild(option);
    });
  };

  // Fetch all Pokémon data
  const fetchAllPokemon = async () => {
    const url = 'https://pokeapi.co/api/v2/pokemon?limit=1000';
    const response = await fetch(url);
    const data = await response.json();
    const pokemonPromises = data.results.map(pokemon => fetch(pokemon.url));
    const pokemonResponses = await Promise.all(pokemonPromises);
    pokemons = await Promise.all(pokemonResponses.map(res => res.json()));
    totalPokemons = pokemons.length;
    fetchPokemon(currentPage); // Load first page
  };

  // Function to fetch Pokémon data based on filters and page
  const fetchPokemon = async (page) => {
    pokemonContainer.innerHTML = ''; // Clear previous Pokémon
    pokemonContainer.appendChild(noResultsMessage); // Ensure noResultsMessage is present

    const [start, end] = regionRanges[currentRegion];
    const offset = (page - 1) * limit;
    filteredPokemons = pokemons.filter(pokemon => pokemon.id >= start && pokemon.id <= end);

    if (currentType !== 'all') {
      const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${currentType}`);
      const typeData = await typeResponse.json();
      const filteredPokemonUrls = typeData.pokemon.map(p => p.pokemon.url);
      filteredPokemons = filteredPokemons.filter(pokemon => filteredPokemonUrls.includes(pokemon.url));
    }

    const paginatedPokemons = filteredPokemons.slice(offset, offset + limit);

    if (paginatedPokemons.length === 0) {
      noResultsMessage.style.display = 'block';
    } else {
      noResultsMessage.style.display = 'none';
      paginatedPokemons.forEach(pokemon => createPokemonCard(pokemon));
    }

    updatePaginationButtons();
    updatePageInfo();
  };

  // Function to create a Pokémon card
  const createPokemonCard = (pokemon) => {
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');

    const pokemonImage = document.createElement('img');
    pokemonImage.src = pokemon.sprites.front_default;
    pokemonImage.alt = pokemon.name;

    const pokemonName = document.createElement('h3');
    pokemonName.textContent = pokemon.name;

    pokemonCard.appendChild(pokemonImage);
    pokemonCard.appendChild(pokemonName);
    pokemonContainer.appendChild(pokemonCard);

    // Add click event to open modal
    pokemonCard.addEventListener('click', () => {
      openModal(pokemon);
    });
  };

  // Function to open the modal
  const openModal = async (pokemon) => {
    // Fetch Pokémon description and specifications
    const speciesResponse = await fetch(pokemon.species.url);
    const speciesData = await speciesResponse.json();
    const description = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text;

    const stats = pokemon.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join(', ');

    document.getElementById('modal-pokemon-name').textContent = pokemon.name;
    document.getElementById('modal-pokemon-image').src = pokemon.sprites.front_default;
    document.getElementById('modal-pokemon-image').alt = pokemon.name;
    document.getElementById('modal-pokemon-description').textContent = description;
    document.getElementById('modal-pokemon-specifications').innerHTML = `
      <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
      <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
      <p><strong>Stats:</strong> ${stats}</p>
    `;
    document.getElementById('pokemon-modal').style.display = 'block';

    // Handle radio button change
    document.getElementById('normal-variant').addEventListener('change', () => {
      document.getElementById('modal-pokemon-image').src = pokemon.sprites.front_default;
    });

    document.getElementById('shiny-variant').addEventListener('change', () => {
      document.getElementById('modal-pokemon-image').src = pokemon.sprites.front_shiny;
    });
  };

  // Function to close the modal
  const closeModal = () => {
    document.getElementById('pokemon-modal').style.display = 'none';
  };

  // Close the modal when clicking the close button or outside the modal
  document.querySelector('.modal .close').addEventListener('click', closeModal);
  window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('pokemon-modal')) {
      closeModal();
    }
  });

  // Function to update pagination buttons
  const updatePaginationButtons = () => {
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage * limit >= filteredPokemons.length;
  };

  // Function to update page info
  const updatePageInfo = () => {
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(filteredPokemons.length / limit)}`;
    pageNumberInput.value = currentPage;
  };

  // Event listeners
  searchBar.addEventListener('input', () => {
    currentPage = 1;
    fetchPokemon(currentPage);
  });

  regionSelect.addEventListener('change', (e) => {
    currentRegion = e.target.value;
    currentPage = 1;
    fetchPokemon(currentPage);
  });

  typeSelect.addEventListener('change', (e) => {
    currentType = e.target.value;
    currentPage = 1;
    fetchPokemon(currentPage);
  });

  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchPokemon(currentPage);
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentPage < Math.ceil(filteredPokemons.length / limit)) {
      currentPage++;
      fetchPokemon(currentPage);
    }
  });

  goToPageButton.addEventListener('click', () => {
    const page = parseInt(pageNumberInput.value);
    if (page >= 1 && page <= Math.ceil(filteredPokemons.length / limit)) {
      currentPage = page;
      fetchPokemon(currentPage);
    }
  });

  // Initial load
  fetchTypes();
  fetchAllPokemon(); // Fetch all Pokémon initially
});
