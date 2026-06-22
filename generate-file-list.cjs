
const fs = require('fs')
const path = require('path')

const source_directory = path.join(__dirname, "src/data")

const combined_data = {
    factions: {},
    leaders: {},
    units: {},
}

function ProcessFactions(current_path, file_name) {
    const directory = path.join(current_path, file_name);
    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        
    } 
}

try { ProcessFactions(source_directory, 'Factions') } catch { console.error("Error!") }

fs.writeFileSync(path.join(source_directory, "combined_data.json"), JSON.stringify(combined_data, null, 2))