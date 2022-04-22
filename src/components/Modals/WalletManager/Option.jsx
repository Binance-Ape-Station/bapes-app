import React from 'react'
import styled from 'styled-components'

const InfoCard = styled.button`
  background-color: ${({ active }) => (active ? 'rgb(64, 68, 79)' : 'rgb(44, 47, 54)')};
  padding: 1rem;
  outline: none;
  border: 1px solid;
  border-radius: 12px;
  width: 100% !important;
  &:focus {
    box-shadow: 0 0 0 1px rgb(255, 145, 0);
  }
  border-color: ${({ active }) => (active ? 'transparent' : 'rgb(64, 68, 79)')};
`

const OptionCard = styled(InfoCard)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 1rem;
`

const OptionCardLeft = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  height: 100%;
`

const OptionCardClickable = styled(OptionCard)`
  margin-top: 0;
  &:hover {
    cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};
    border: ${({ clickable }) => (clickable ? `1px solid rgb(255, 145, 0)` : ``)};
  }
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`

const GreenCircle = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;

  &:first-child {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: #27AE60;
    border-radius: 50%;
  }
`

const CircleWrapper = styled.div`
  color: #27AE60;
  display: flex;
  justify-content: center;
  align-items: center;
`

const HeaderText = styled.div`
  display: flex;
  flex-flow: row nowrap;
  color: ${props => (props.color === 'blue' ? 'rgb(255, 145, 0)' : 'white')};
  font-size: 1rem;
  font-weight: 500;
`

const SubHeader = styled.div`
  color: white;
  margin-top: 10px;
  font-size: 12px;
`

const IconWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '24px')};
    width: ${({ size }) => (size ? size + 'px' : '24px')};
  }
`

/*
${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
*/

export default function Option({
  link = null,
  clickable = true,
  size,
  onClick = null,
  color,
  header,
  subheader = null,
  icon,
  active = false,
  id
}) {
  const content = (
    <OptionCardClickable id={id} onClick={onClick} clickable={clickable && !active} active={active}>
      <OptionCardLeft>
        <HeaderText color={color}>
          {active ? (
            <CircleWrapper>
              <GreenCircle>
                <div />
              </GreenCircle>
            </CircleWrapper>
          ) : (
            ''
          )}
          {header}
        </HeaderText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </OptionCardLeft>
      <IconWrapper size={size}>
        <img src={icon} alt="Icon" />
      </IconWrapper>
    </OptionCardClickable>
  )
  if (link) {
    return <a href={link} target="_blank" rel="noreferrer">{content}</a>
  }

  return content
}
