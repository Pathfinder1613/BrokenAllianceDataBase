import WEAPONS from '../services/NewTestData/Weapons.json'
import ABILITIES from '../services/NewTestData/Abilities.json'

export default function DetailViewer()
{
    const ability = ABILITIES.deployable_smoke;

    return (
        <>
            {
                ability.description.replaceAll(/\<([\w]+?)\>/g, (match, key) => ability[key])
            }
        </>
    )
}