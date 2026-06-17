import WEAPONS from '../data/Weapons.json'
import ABILITIES from '../data/Abilities.json'

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