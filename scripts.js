// scripts.js
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
  
    // Function to fetch Pokémon data from PokéAPI
    const fetchPokemon = async (page) => {
      pokemonContainer.innerHTML = ''; // Clear previous Pokémon
      pokemonContainer.appendChild(noResultsMessage); // Ensure noResultsMessage is present
  
      const offset = (page - 1) * limit;
      const [start, end] = regionRanges[currentRegion];
  
      let url = `https://pokeapi.co/api/v2/pokemon?offset=${offset + start - 1}&limit=${Math.min(limit, end - start + 1 - offset)}`;
      let pokemons = [];
      let totalFilteredPokemons = 0;
  
      if (currentType !== 'all') {
        const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${currentType}`);
        const typeData = await typeResponse.json();
        const filteredPokemonUrls = typeData.pokemon.map(p => p.pokemon.url);
        const filteredPokemonPromises = filteredPokemonUrls.map(url => fetch(url));
        const filteredPokemonResponses = await Promise.all(filteredPokemonPromises);
        filteredPokemons = await Promise.all(filteredPokemonResponses.map(res => res.json()));
  
        // Filter based on region range
        pokemons = filteredPokemons.filter(pokemon => pokemon.id >= start && pokemon.id <= end);
        totalFilteredPokemons = pokemons.length; // Set filtered total
      } else {
        const response = await fetch(url);
        const data = await response.json();
        const pokemonPromises = data.results.map(pokemon => fetch(pokemon.url));
        const pokemonResponses = await Promise.all(pokemonPromises);
        pokemons = await Promise.all(pokemonResponses.map(res => res.json()));
      }
  
      if (pokemons.length === 0) {
        noResultsMessage.style.display = 'block';
      } else {
        noResultsMessage.style.display = 'none';
        pokemons.forEach(pokemon => createPokemonCard(pokemon));
      }
  
      // Update totalPokemons based on filtered data if type is selected
      totalPokemons = currentType !== 'all' ? totalFilteredPokemons : pokemons.length;
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
    };
  
    // Function to filter Pokémon based on search input
    const filterPokemon = () => {
      const filter = searchBar.value.toLowerCase();
      const pokemonCards = document.querySelectorAll('.pokemon-card');
      pokemonCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        if (name.includes(filter)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    };
  
    // Function to update pagination buttons' state
    const updatePaginationButtons = () => {
      prevButton.disabled = currentPage === 1;
      nextButton.disabled = currentPage * limit >= totalPokemons;
    };
  
    // Function to update the page information
    const updatePageInfo = () => {
      pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(totalPokemons / limit)}`;
      pageNumberInput.value = currentPage;
    };
  
    // Event listeners for pagination buttons
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        fetchPokemon(currentPage);
      }
    });
  
    nextButton.addEventListener('click', () => {
      if (currentPage * limit < totalPokemons) {
        currentPage++;
        fetchPokemon(currentPage);
      }
    });
  
    goToPageButton.addEventListener('click', () => {
      const page = parseInt(pageNumberInput.value);
      if (page > 0 && page <= Math.ceil(totalPokemons / limit)) {
        currentPage = page;
        fetchPokemon(currentPage);
      }
    });
  
    searchBar.addEventListener('input', filterPokemon);
  
    regionSelect.addEventListener('change', (e) => {
      currentRegion = e.target.value;
      currentPage = 1; // Reset to the first page for new region
      fetchPokemon(currentPage);
    });
  
    typeSelect.addEventListener('change', (e) => {
      currentType = e.target.value;
      currentPage = 1; // Reset to the first page for new type
      fetchPokemon(currentPage);
    });
  
    // Initial load
    fetchTypes();
    fetchPokemon(currentPage);
  });
  