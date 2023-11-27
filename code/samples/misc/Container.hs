{-|
K8sh is my homegrown generator of Kubernetes manifests. For the managing
and parametrizing of an entire Kubernetes project, it's easier to use and
more readable, than e.g. Helm Charts (...which I will probably have to use
eventually).
-}

module K8sh.Container ( Container
                      , makeContainer
                      , InitContainer ) where

import Data.Set ( Set, empty, insert )
import Kirkiano.Util ( Name, Named(..), Has(..), From(..),
                       More(..), MoreM(..), AlreadyHas(..) )
import Kirkiano.Util.System ( EnvVar )
import qualified Kirkiano.Docker as D
import K8sh.Command ( Command )
import K8sh.Volume ( VolumeMount )
import K8sh.RegistrySecret ( RegistrySecret )


-- | Container
--
-- This differs from 'Kirkiano.Docker.Container' (and contains it) since
-- it needs other things, /eg/ 'Command', 'VolumeMount', /etc/.
--
-- Moreover any 'RegistrySecret' should be placed here and not in
-- 'K8sh.APIObject.Pod', even though a manifest displays secrets
-- for the whole pod and not for each container. See 'K8sh.APIObject.Pod'
-- for how secrets are extracted from all of a pod's containers.
data Container a = Container {
    vols_  :: Set VolumeMount
  , sec_   :: Maybe RegistrySecret
  , cmd_   :: Maybe Command
  , inner_ :: D.Container a
} deriving (Eq, Show, Ord)

-- | Creates a container
makeContainer :: Name D.ContainerT
              -> D.ImageNameTag
              -> a
              -> Container a
makeContainer n i = Container empty Nothing Nothing . D.makeContainer n i

-----------------------------------------------------------

instance Named D.ContainerT (Container a) where
  name = name . inner_

instance Has (Container a) a where
  get = get . inner_

instance Has (Container a) D.ImageNameTag where
  get = get . inner_

instance Has (Container a) (Set EnvVar) where
  get = get . inner_

instance Has (Container a) (Set VolumeMount) where
  get = vols_

instance Has (Container a) (Maybe Command) where
  get = cmd_

instance Has (Container a) (Maybe RegistrySecret) where
  get = sec_

instance Functor Container where
  fmap f (Container vs s d c) = Container vs s d (fmap f c)

-----------------------------------------------------------

instance More (Container a) Command where
  more d (Container vs s _ c) = Container vs s (Just d) c

instance MoreM (Container a)
               (Either (AlreadyHas Command))
               Command where
  moreM d (Container  _ _ (Just _) _) = Left . AlreadyHas $ d
  moreM d (Container vs s  Nothing c) = Right $ Container vs s (Just d) c

instance More (Container a) RegistrySecret where
  more s (Container vs _ d c) = Container vs (Just s) d c

instance MoreM (Container a)
               (Either (AlreadyHas RegistrySecret))
               RegistrySecret where
  moreM s (Container  _ (Just _) _ _) = Left . AlreadyHas $ s
  moreM s (Container vs  Nothing d c) = Right $ Container vs (Just s) d c

instance More (Container a) EnvVar where
  more e (Container vs s d c) = Container vs s d (more e c)

instance More (Container a) VolumeMount where
  more v (Container vs0 s d c) = Container vs1 s d c where
    vs1 = insert v vs0

-----------------------------------------------------------
-- InitContainer

-- | A light wrapper for a 'Container ()'.
newtype InitContainer = InitContainer (Container ())
  deriving (Eq, Show, Ord)

instance From InitContainer (Container ()) where
  from (InitContainer c) = c

instance From (Container ()) InitContainer where
  from = InitContainer

instance From InitContainer (Container (Maybe a)) where
  from ic = fmap (const Nothing) (from ic :: Container ())
