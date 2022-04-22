import React, { useEffect, useRef } from 'react';

import styled from 'styled-components';

import Jazzicon from 'jazzicon';
import { useActiveWeb3React } from 'src/hooks';

const StyledIdenticonContainer = styled.div`
  display: inline-block;
  top: 2px;
  height: 1rem;
  width: 1rem;
  margin-left: 8px;
  border-radius: 1.125rem;
  background-color: #CED0D9;
`

export default function Identicon() {
  const ref = useRef()

  const { account } = useActiveWeb3React()

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = ''
      const jazzicon = ref.current.appendChild(Jazzicon(16, parseInt(account.slice(2, 10), 16)))
      jazzicon.style.display = 'block';
    }
  }, [account])

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
  return <StyledIdenticonContainer ref={ref} />
}
