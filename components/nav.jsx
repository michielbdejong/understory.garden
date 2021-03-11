import { useState } from 'react'
import Link from 'next/link'

import { getUrl, getSourceUrl } from '@inrupt/solid-client'
import { FOAF, LDP } from '@inrupt/vocab-common-rdf'
import { Transition } from '@headlessui/react'
import { useAuthentication, useLoggedIn, useMyProfile, useContainer, useWebId } from 'swrlit'
import { useRouter } from 'next/router'

import { MailIcon } from '../components/icons'
import { useApp, useWorkspacePreferencesFileUris } from '../hooks/app'
import { deleteResource } from '../utils/fetch'
import { appPrefix } from '../utils/uris'
import Image from 'next/image'

function DevTools(){
  const webId = useWebId()

  const { resource: appResource } = useApp(webId)
  const { public: workspacePreferencesFileUri } = useWorkspacePreferencesFileUris(webId)
  return (
    <ul className="flex flex-column">
      <li className="mx-3">
        prefix: {appPrefix}
      </li>
      <li>
        <button className="btn text-xs" onClick={() => deleteResource(getSourceUrl(appResource))}>
          delete app file
        </button>
      </li>
      <li>
        <button className="btn text-xs" onClick={() => deleteResource(workspacePreferencesFileUri)}>
          delete default workspace
        </button>
      </li>
    </ul>
  )
}

export default function Nav() {
  const router = useRouter()
  const { query: { devtools } } = router
  const loggedIn = useLoggedIn()
  const { logout } = useAuthentication()
  const { profile } = useMyProfile()
  const profileImage = profile && getUrl(profile, FOAF.img)
  const inboxUri = profile && getUrl(profile, LDP.inbox)
  const { resources } = useContainer(inboxUri)
  const hasMessages = resources && (resources.length > 0)
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <nav className="pt-3 flex flex-col">
      <ul className="flex justify-between items-center">
        <Link href="/">
          <a>
            <Image src="/logo.png"
                   alt="a logo consisting of a multi-colored mushroom with roots digging deep into the understory"
                   width={60}
                   height={60}
            />
          </a>
        </Link>
        <ul className="flex justify-between items-center space-x-4">
          {loggedIn && (
            <Link href="/messages">
              <a className="text-white">
                <div className="relative">
                  <MailIcon className="w-12"/>
                  {hasMessages && (
                    <div className="absolute top-0 right-0 block h-5 w-5 rounded-full ring-2 ring-white bg-red-400 pl-2 leading-3 pt-0.5">
                      { resources.length }
                    </div>
                  )}
                </div>
              </a>
            </Link>
          )}
          {loggedIn && (
            <div>
              {profileImage ? (
                <img src={profileImage}
                     onClick={() => setMenuOpen(!menuOpen)}
                     className="rounded-full h-12 w-12 object-cover cursor-pointer" />
              ) : (
                <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => setMenuOpen(!menuOpen)}>
                  <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                </span>
              )}
              <Transition
                show={menuOpen}
                enter="transition ease-out duration-100"
                enterFrom="translate-x-transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95">
                {
                  (ref) => (
                    <div ref={ref} className="z-30 bg-gray-800 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <a href="/privacy" className="block px-4 py-2 text-sm text-gray-100 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                          privacy
                        </a>
                        <a href="/tos" className="block px-4 py-2 text-sm text-gray-100 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                          terms of service
                        </a>
                        {loggedIn && (
                          <button type="submit" class="block w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem"
                                  onClick={logout}>
                            log out
                          </button>
                        )}
                      </div>
                    </div>
                  )
                }
              </Transition>
            </div>
          )}
        </ul>
      </ul>
      {devtools && <DevTools/>}
    </nav>
  )
}
