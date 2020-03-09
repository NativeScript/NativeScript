#!/bin/bash

app_name="$1" r_url="$2" local_dir="$3" && shift 3

echo $app_name
cwd=${PWD}
echo "r_url: ${r_url}"
echo "local_dir: ${local_dir}"
rm -rf ${PWD}/e2e/resources/*
mkdir -p ${PWD}/e2e/resources/images

(
    if [ -d "$local_dir" ]; then
        echo "Extend repository"
        cd "$local_dir"
    else
        mkdir -p "$local_dir"
        cd "$local_dir"
        git init
        git remote add origin "$r_url"
    fi

    echo ${PWD}

    git config core.sparseCheckout true

    # Loops over remaining args
    rm -rf .git/info/sparse-checkout || true
    if [ $1 = "all" ]; then
        echo "$app_name" >> .git/info/sparse-checkout
    else
        for i; do
            echo "$app_name/$i" >> .git/info/sparse-checkout
        done
    fi
    echo "scripts" >> .git/info/sparse-checkout
    cat .git/info/sparse-checkout
    git read-tree -mu HEAD
    git pull --depth=1 origin master -f
)

cd "${cwd}"
ln -s "$local_dir/$app_name" "${cwd}/e2e/resources/images/" || true
