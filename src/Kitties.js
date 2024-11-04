import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import {useSubstrate, useSubstrateState} from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

export default function Kitties (props) {
  const { api,keyring,currentAccount} = useSubstrateState()
  let accountPair= null;
  if (currentAccount!=null){
    const address = currentAccount.address.toString();
    accountPair=keyring.getPair(address);
  }


  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')
  // Kitties' DNAs
  const [kittyDNAs, setKittyDNAs] = useState([])
  // Kitties' Gender
  const [kittyGenders, setKittyGenders] = useState([])
  // Kitties' Owners
  const [kittyOwners, setKittyOwners] = useState([])

  const fetchKitties = () => {
    // TODO: 在这里调用 `api.query.kitties.*` 函数去取得猫咪的信息。
    // 你需要取得：
    //   - 共有多少只猫咪
    //   - 每只猫咪的主人是谁
    //   - 每只猫咪的 DNA 是什么，用来组合出它的形态

    let unsubscribe
    api.query.kitties.kittiesCount(cnt => {
      if (cnt !== '') {
        // The amounts of all kitties.
        const kittyIds = Array.from(Array(parseInt(cnt, 10)), (v, k) => k)
        // The owners of all kitties.
        api.query.kitties.owner.multi(kittyIds, kittyOwners => {
          setKittyOwners(kittyOwners)
        }).catch(console.error)
        // The DNAs of all kitties.
        api.query.kitties.kitties.multi(kittyIds, kittyDna => {
          setKittyDNAs(kittyDna)
        }).catch(console.error)
        api.query.kitties.kittyGender.multi(kittyIds, kittyGender => {
          setKittyGenders(kittyGender)
        }).catch(console.error)
      }
    }).then(unsub => {
      unsubscribe = unsub
    }).catch(console.error)

    return () => unsubscribe && unsubscribe()
  }

  const populateKitties = () => {
    // TODO: 在这里添加额外的逻辑。你需要组成这样的数组结构：
    //  ```javascript
    //  const kitties = [{
    //    id: 0,
    //    dna: ...,
    //    owner: ...
    //  }, { id: ..., dna: ..., owner: ... }]
    //  ```
    // 这个 kitties 会传入 <KittyCards/> 然后对每只猫咪进行处理

    const kitties = []
    for (let i = 0; i < kittyDNAs.length; ++i) {
      const kitty = {}
      kitty.id = i
      kitty.dna = kittyDNAs[i].unwrap()
      kitty.owner = keyring.encodeAddress(kittyOwners[i].unwrap())
      if (kittyGenders[i]!==undefined){
        kitty.gender = kittyGenders[i].unwrap()
      }

      kitties[i] = kitty
    }
    setKitties(kitties)
  }

  useEffect(fetchKitties, [api, keyring])
  useEffect(populateKitties, [keyring, kittyDNAs, kittyOwners,kittyGenders])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kitties',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
