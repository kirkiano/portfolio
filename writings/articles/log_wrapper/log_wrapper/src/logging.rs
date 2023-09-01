
#[derive(Debug, Copy, Clone)]
pub struct Logging<T>(T);


impl<T> Logging<T> {
    pub fn new(t: T) -> Self {
        Self(t)
    }

    pub fn inner(&self) -> &T {
        &self.0
    }
}