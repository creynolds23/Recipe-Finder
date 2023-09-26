// Define API key
const API_KEY = 'cd31fc17fe84489daa8a98b615a5cfba'; // Replace with your API key
const API_URL = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=`;

// Get references to HTML elements
const resultsContainer = document.getElementById('results');
const recipeForm = document.getElementById('recipe-form');

// Recursive function to fetch recipes
async function fetchRecipesRecursively(ingredients, cuisine = '', page = 1, recipes = []) {
    const perPage = 10; // Number of recipes per page
    const offset = (page - 1) * perPage;
    let url = `${API_URL}${encodeURIComponent(ingredients)}&number=${perPage}&offset=${offset}`;
    
    // Include the cuisine type as a query parameter if selected
    if (cuisine) {
        url += `&cuisine=${cuisine}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data from the API');
        }
        const data = await response.json();
        const combinedRecipes = [...recipes, ...data];
        
        // Specify a limit or criteria for recursion (fetch up to 30 recipes)
        if (combinedRecipes.length < 30 && data.length === perPage) {
            // Recursively fetch more recipes on the next page
            return fetchRecipesRecursively(ingredients, cuisine, page + 1, combinedRecipes);
        } else {
            return combinedRecipes;
        }
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to propagate it to the caller
    }
}

// Event listener for the form submission
recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ingredients = document.getElementById('ingredients').value;
    const cuisine = document.getElementById('cuisine').value; // Get the selected cuisine

    try {
        // Call the recursive function to fetch recipes
        const recipes = await fetchRecipesRecursively(ingredients, cuisine);
        displayRecipes(recipes);
    } catch (error) {
        console.error(error);
        resultsContainer.innerHTML = 'An error occurred while fetching data.';
    }
});

// Function to display recipes on the web page
async function displayRecipes(recipes) {
    resultsContainer.innerHTML = '';

    if (recipes.length === 0) {
        resultsContainer.innerHTML = 'No recipes found for these ingredients.';
        return;
    }

    // Loop through each recipe and create a recipe card
    recipes.forEach(async (recipe) => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');

        // Fetch additional details for each recipe, including the recipe's URL
        const recipeDetails = await fetchRecipeDetails(recipe.id);

        // Create the HTML structure for the recipe card
        recipeCard.innerHTML = `
            <h3>${recipe.title}</h3>
            <img src="${recipe.image}" alt="${recipe.title}">
            <p><a href="${recipeDetails.sourceUrl}" target="_blank">View Recipe</a></p>
        `;

        // Append the recipe card to the results container
        resultsContainer.appendChild(recipeCard);
    });
}

// Function to fetch additional recipe details
async function fetchRecipeDetails(recipeId) {
    const detailsURL = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;
    const response = await fetch(detailsURL);
    if (!response.ok) {
        throw new Error('Failed to fetch recipe details from the API');
    }
    const recipeDetails = await response.json();
    return recipeDetails;
}