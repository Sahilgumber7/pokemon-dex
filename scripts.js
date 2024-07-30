// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const pokemonContainer = document.getElementById('pokemon-container');
    const searchBar = document.getElementById('search-bar');
    const regionSelect = document.getElementById('region-select');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const goToPageButton = document.getElementById('go-to-page');
    const pageNumberInput = document.getElementById('page-number');
    const pageInfo = document.getElementById('page-info');
    let currentPage = 1;
    const limit = 50;
    let totalPokemons = 0;
    let currentRegion = 'all';
  
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
  
    // Function to fetch total Pokémon count from PokéAPI
    const fetchTotalPokemons = async (region = 'all') => {
      if (region === 'all') {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
        const data = await response.json();
        totalPokemons = data.count;
      } else {
        totalPokemons = regionRanges[region][1] - regionRanges[region][0] + 1;
      }
      updatePageInfo();
    };
  
    // Function to fetch Pokémon data from PokéAPI
    const fetchPokemon = async (page, region = 'all') => {
      pokemonContainer.innerHTML = ''; // Clear previous Pokémon
      const offset = (page - 1) * limit;
      const [start, end] = regionRanges[region];
      const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset + start - 1}&limit=${Math.min(limit, end - start + 1 - offset)}`;
      const response = await fetch(url);
      const data = await response.json();
      data.results.forEach(pokemon => {
        fetchPokemonDetails(pokemon.url);
      });
      updatePaginationButtons();
    };
  
    // Function to fetch detailed data for each Pokémon
    const fetchPokemonDetails = async (url) => {
      const response = await fetch(url);
      const pokemon = await response.json();
      createPokemonCard(pokemon);
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
        fetchPokemon(currentPage, currentRegion);
      }
    });
  
    nextButton.addEventListener('click', () => {
      if (currentPage * limit < totalPokemons) {
        currentPage++;
        fetchPokemon(currentPage, currentRegion);
      }
    });
  
    goToPageButton.addEventListener('click', () => {
      const page = parseInt(pageNumberInput.value);
      if (page > 0 && page <= Math.ceil(totalPokemons / limit)) {
        currentPage = page;
        fetchPokemon(currentPage, currentRegion);
      }
    });
  
    searchBar.addEventListener('input', filterPokemon);
  
    regionSelect.addEventListener('change', (e) => {
      currentRegion = e.target.value;
      currentPage = 1; // Reset to the first page for new region
      fetchTotalPokemons(currentRegion);
      fetchPokemon(currentPage, currentRegion);
    });
  
    // Initial load
    fetchTotalPokemons();
    fetchPokemon(currentPage);
  });
  